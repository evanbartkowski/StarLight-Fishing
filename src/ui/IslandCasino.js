// IslandCasino.js — Drift-Isle Gambler NPC minigames (Roulette & Blackjack) supporting Coins or Gems

export const ROULETTE_RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export function getRouletteColor(pocket) {
  if (pocket === 0) return 'green';
  return ROULETTE_RED_NUMBERS.has(pocket) ? 'red' : 'black';
}

export function resolveRouletteSpin(betType, stake, currency = 'coins', targetNum = null, forcedPocket = null) {
  const cleanStake = Math.max(1, Math.floor(Number(stake) || 0));
  const pocket = Number.isInteger(forcedPocket) && forcedPocket >= 0 && forcedPocket <= 36
    ? forcedPocket
    : Math.floor(Math.random() * 37);
  const color = getRouletteColor(pocket);

  let won = false;
  let multiplier = 0;

  if (betType === 'red' && color === 'red') {
    won = true;
    multiplier = 2;
  } else if (betType === 'black' && color === 'black') {
    won = true;
    multiplier = 2;
  } else if (betType === 'even' && pocket > 0 && pocket % 2 === 0) {
    won = true;
    multiplier = 2;
  } else if (betType === 'odd' && pocket > 0 && pocket % 2 === 1) {
    won = true;
    multiplier = 2;
  } else if (betType === 'green' && pocket === 0) {
    won = true;
    multiplier = 18;
  } else if (betType === 'number' && Number.isInteger(targetNum) && pocket === targetNum) {
    won = true;
    multiplier = 18;
  }

  const payout = won ? cleanStake * multiplier : 0;
  return {
    pocket,
    color,
    won,
    multiplier,
    payout,
    stake: cleanStake,
    currency,
    net: payout - cleanStake,
  };
}

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createShuffledDeck(rng = Math.random) {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, isRed: suit === '♥' || suit === '♦' });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

export function evaluateBlackjackHand(cards = []) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') {
      total += 11;
      aces += 1;
    } else if (['K', 'Q', 'J'].includes(c.rank)) {
      total += 10;
    } else {
      total += Number(c.rank) || 0;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  const isBlackjack = cards.length === 2 && total === 21;
  return { total, isBust: total > 21, isBlackjack, isSoft: aces > 0 };
}

export function resolveBlackjackRound(playerCards, dealerCards, stake, currency = 'coins') {
  const cleanStake = Math.max(1, Math.floor(Number(stake) || 0));
  const pEval = evaluateBlackjackHand(playerCards);
  const dEval = evaluateBlackjackHand(dealerCards);

  if (pEval.isBust) {
    return { outcome: 'loss', reason: 'Bust over 21!', playerTotal: pEval.total, dealerTotal: dEval.total, payout: 0, net: -cleanStake, currency };
  }
  if (pEval.isBlackjack && !dEval.isBlackjack) {
    const payout = Math.ceil(cleanStake * 2.5);
    return { outcome: 'blackjack', reason: 'Natural Blackjack! (3:2 Payout)', playerTotal: pEval.total, dealerTotal: dEval.total, payout, net: payout - cleanStake, currency };
  }
  if (dEval.isBlackjack && !pEval.isBlackjack) {
    return { outcome: 'loss', reason: 'Dealer drew Blackjack.', playerTotal: pEval.total, dealerTotal: dEval.total, payout: 0, net: -cleanStake, currency };
  }
  if (dEval.isBust) {
    return { outcome: 'win', reason: 'Dealer busts over 21!', playerTotal: pEval.total, dealerTotal: dEval.total, payout: cleanStake * 2, net: cleanStake, currency };
  }
  if (pEval.total > dEval.total) {
    return { outcome: 'win', reason: 'Your hand beats the dealer!', playerTotal: pEval.total, dealerTotal: dEval.total, payout: cleanStake * 2, net: cleanStake, currency };
  }
  if (pEval.total === dEval.total) {
    return { outcome: 'push', reason: 'Push — stake returned.', playerTotal: pEval.total, dealerTotal: dEval.total, payout: cleanStake, net: 0, currency };
  }
  return { outcome: 'loss', reason: 'Dealer holds the higher hand.', playerTotal: pEval.total, dealerTotal: dEval.total, payout: 0, net: -cleanStake, currency };
}

function formatTimer(sec) {
  const s = Math.max(0, Math.ceil(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

export function openIslandCasinoModal(uiManager, saveSystem, soundManager, islandState) {
  uiManager.activeModal = 'island_casino';

  let activeTab = 'roulette';
  let currency = 'coins'; // 'coins' | 'gems'
  let stake = 50;
  let rouletteBet = 'red';
  let luckyNum = 7;
  let rouletteResultHtml = '<span class="casino-muted">Pick a pocket or color and spin the Drift-Isle wheel.</span>';
  let isSpinning = false;

  // Blackjack round state
  let bjDeck = [];
  let bjPlayer = [];
  let bjDealer = [];
  let bjActive = false;
  let bjStake = 0;
  let bjCurrency = 'coins';
  let bjStatusHtml = '<span class="casino-muted">Choose your wager and deal a hand against Captain Lucky.</span>';

  const getBalance = (cur = currency) => (
    cur === 'gems'
      ? Math.max(0, Math.floor(saveSystem.getGemBalance?.() ?? saveSystem.data?.gems ?? 0))
      : Math.max(0, Math.floor(saveSystem.data?.coins ?? 0))
  );

  const debitStake = (amount, cur) => {
    const clean = Math.max(1, Math.floor(amount));
    if (getBalance(cur) < clean) return false;
    if (cur === 'gems') {
      if (typeof saveSystem.spendGems === 'function') {
        const res = saveSystem.spendGems(clean);
        if (!res?.success && res !== true) {
          saveSystem.data.gems = Math.max(0, (saveSystem.data.gems || 0) - clean);
          saveSystem.save?.();
        }
      } else {
        saveSystem.data.gems = Math.max(0, (saveSystem.data.gems || 0) - clean);
        saveSystem.save?.();
      }
    } else {
      saveSystem.adjustCoins?.(-clean);
      if (!saveSystem.adjustCoins) {
        saveSystem.data.coins = Math.max(0, (saveSystem.data.coins || 0) - clean);
        saveSystem.save?.();
      }
    }
    return true;
  };

  const creditWinnings = (amount, cur) => {
    const clean = Math.max(0, Math.floor(amount));
    if (clean <= 0) return;
    if (cur === 'gems') {
      saveSystem.data.gems = (saveSystem.data.gems || 0) + clean;
      saveSystem.save?.();
    } else {
      saveSystem.addCoins?.(clean);
    }
  };

  const fmtAmount = (amt, cur) => (cur === 'gems' ? `💎 ${amt.toLocaleString()} Gems` : `🪙 $${amt.toLocaleString()}`);

  const renderCard = (card, hidden = false) => {
    if (hidden) {
      return '<div class="playing-card card-back" aria-label="Face-down card"><span>★</span></div>';
    }
    return `<div class="playing-card ${card.isRed ? 'card-red' : 'card-black'}"><span class="card-rank">${card.rank}</span><span class="card-suit">${card.suit}</span></div>`;
  };

  const bodyHtml = () => {
    const balCoins = getBalance('coins');
    const balGems = getBalance('gems');
    const maxCur = getBalance(currency);
    stake = Math.max(1, Math.min(Math.max(1, maxCur), Math.floor(stake || (currency === 'gems' ? 1 : 50))));
    const presets = currency === 'gems' ? [1, 2, 5, 10] : [25, 100, 500, 2500];
    const timeLeftStr = islandState?.active ? formatTimer(islandState.timer) : '0:00';

    const pEval = evaluateBlackjackHand(bjPlayer);
    const dEval = bjActive ? evaluateBlackjackHand(bjDealer.slice(0, 1)) : evaluateBlackjackHand(bjDealer);

    return `
      <div class="casino-panel">
        <div class="casino-header">
          <div class="casino-npc-badge">
            <span class="casino-isle-icon">🏝️</span>
            <div>
              <strong>Captain Lucky's Floating Parlour</strong>
              <small>Only docked in the shallows for ⏳ <span id="casino-timer-text">${timeLeftStr}</span></small>
            </div>
          </div>
          <div class="casino-balances">
            <span class="casino-bal-pill">🪙 $${balCoins.toLocaleString()}</span>
            <span class="casino-bal-pill is-gems">💎 ${balGems.toLocaleString()}</span>
          </div>
        </div>

        <div class="casino-tabs">
          <button type="button" class="tab-btn ${activeTab === 'roulette' ? 'active' : ''}" data-casino-tab="roulette">🎡 Roulette</button>
          <button type="button" class="tab-btn ${activeTab === 'blackjack' ? 'active' : ''}" data-casino-tab="blackjack">🃏 Blackjack</button>
        </div>

        <div class="casino-wager-bar" ${bjActive ? 'style="opacity:0.55;pointer-events:none;"' : ''}>
          <div class="casino-currency-toggle">
            <button type="button" class="btn btn-sm ${currency === 'coins' ? 'btn-primary' : 'btn-secondary'}" data-casino-cur="coins">🪙 Gold</button>
            <button type="button" class="btn btn-sm ${currency === 'gems' ? 'btn-primary' : 'btn-secondary'}" data-casino-cur="gems">💎 Gems</button>
          </div>
          <div class="casino-bet-row">
            ${presets.map(p => `<button type="button" class="btn btn-sm ${stake === p ? 'btn-buy' : 'btn-outline'}" data-casino-preset="${p}">${currency === 'gems' ? `💎${p}` : `$${p}`}</button>`).join('')}
            <input type="number" id="casino-stake-input" min="1" max="${Math.max(1, maxCur)}" value="${stake}" aria-label="Wager amount" />
          </div>
        </div>

        ${activeTab === 'roulette' ? `
          <div class="casino-game-box">
            <div class="roulette-options-grid">
              <button type="button" class="roulette-opt is-red ${rouletteBet === 'red' ? 'selected' : ''}" data-rbet="red">🔴 Red <span>2x</span></button>
              <button type="button" class="roulette-opt is-black ${rouletteBet === 'black' ? 'selected' : ''}" data-rbet="black">⚫ Black <span>2x</span></button>
              <button type="button" class="roulette-opt ${rouletteBet === 'even' ? 'selected' : ''}" data-rbet="even">Even <span>2x</span></button>
              <button type="button" class="roulette-opt ${rouletteBet === 'odd' ? 'selected' : ''}" data-rbet="odd">Odd <span>2x</span></button>
              <button type="button" class="roulette-opt is-green ${rouletteBet === 'green' ? 'selected' : ''}" data-rbet="green">🟢 Zero (0) <span>18x</span></button>
              <button type="button" class="roulette-opt ${rouletteBet === 'number' ? 'selected' : ''}" data-rbet="number">
                # <input type="number" id="roulette-lucky-num" min="0" max="36" value="${luckyNum}" style="width:46px;" aria-label="Specific pocket number" /> <span>18x</span>
              </button>
            </div>
            <div class="casino-result-banner" id="roulette-result">${rouletteResultHtml}</div>
            <button type="button" class="btn btn-buy casino-play-btn" id="btn-roulette-spin" ${isSpinning || maxCur < 1 ? 'disabled' : ''}>
              ${isSpinning ? '🎡 Spinning Wheel...' : `🎡 Spin Roulette (${fmtAmount(stake, currency)})`}
            </button>
          </div>
        ` : `
          <div class="casino-game-box">
            <div class="blackjack-table">
              <div class="bj-hand-section">
                <div class="bj-label">Captain Lucky's Hand ${bjDealer.length ? `(${bjActive ? `${dEval.total}+?` : dEval.total})` : ''}</div>
                <div class="bj-cards">${bjDealer.length ? bjDealer.map((c, idx) => renderCard(c, bjActive && idx === 1)).join('') : '<span class="casino-muted">— Waiting for deal —</span>'}</div>
              </div>
              <div class="bj-hand-section">
                <div class="bj-label">Your Hand ${bjPlayer.length ? `(${pEval.total})` : ''}</div>
                <div class="bj-cards">${bjPlayer.length ? bjPlayer.map(c => renderCard(c)).join('') : '<span class="casino-muted">— Ready to play —</span>'}</div>
              </div>
            </div>
            <div class="casino-result-banner">${bjStatusHtml}</div>
            <div class="bj-actions">
              ${!bjActive ? `
                <button type="button" class="btn btn-buy casino-play-btn" id="btn-bj-deal" ${maxCur < 1 ? 'disabled' : ''}>
                  🃏 Deal Hand (${fmtAmount(stake, currency)})
                </button>
              ` : `
                <button type="button" class="btn btn-primary" id="btn-bj-hit">✋ Hit</button>
                <button type="button" class="btn btn-warning" id="btn-bj-stand">🛑 Stand</button>
                ${bjPlayer.length === 2 && getBalance(bjCurrency) >= bjStake ? `<button type="button" class="btn btn-buy" id="btn-bj-double">⚡ Double</button>` : ''}
              `}
            </div>
          </div>
        `}
      </div>
    `;
  };

  let timerInterval = null;
  const renderModal = () => {
    if (uiManager.activeModal !== 'island_casino') return;
    const contentEl = document.getElementById('modal-content');
    if (contentEl) {
      contentEl.innerHTML = bodyHtml();
      bindEvents();
    }
  };

  const finishBlackjack = (deck, pCards, dCards) => {
    const res = resolveBlackjackRound(pCards, dCards, bjStake, bjCurrency);
    bjActive = false;
    if (res.payout > 0) creditWinnings(res.payout, bjCurrency);
    if (res.outcome === 'blackjack' || res.outcome === 'win') {
      soundManager?.playCoin?.();
      bjStatusHtml = `<strong style="color:#4ade80;">🎉 ${res.reason} Won ${fmtAmount(res.payout, bjCurrency)}!</strong>`;
    } else if (res.outcome === 'push') {
      soundManager?.playButtonClick?.();
      bjStatusHtml = `<strong style="color:#fde047;">🤝 ${res.reason} (+${fmtAmount(res.payout, bjCurrency)})</strong>`;
    } else {
      soundManager?.playHazard?.();
      bjStatusHtml = `<strong style="color:#f87171;">💸 ${res.reason} (-${fmtAmount(bjStake, bjCurrency)})</strong>`;
    }
    bjPlayer = pCards;
    bjDealer = dCards;
    bjDeck = deck;
    renderModal();
  };

  const bindEvents = () => {
    document.querySelectorAll('[data-casino-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isSpinning) return;
        activeTab = btn.dataset.casinoTab;
        renderModal();
      });
    });
    document.querySelectorAll('[data-casino-cur]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (bjActive || isSpinning) return;
        currency = btn.dataset.casinoCur;
        stake = currency === 'gems' ? 1 : 50;
        renderModal();
      });
    });
    document.querySelectorAll('[data-casino-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.dataset.casinoPreset) || 1;
        const maxCur = Math.max(1, getBalance(currency));
        stake = Math.min(maxCur, val);
        renderModal();
      });
    });
    document.getElementById('casino-stake-input')?.addEventListener('change', (e) => {
      const val = Math.floor(Number(e.target.value) || 1);
      const maxCur = Math.max(1, getBalance(currency));
      stake = Math.max(1, Math.min(maxCur, val));
      renderModal();
    });
    document.querySelectorAll('[data-rbet]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target?.id === 'roulette-lucky-num') {
          rouletteBet = 'number';
          return;
        }
        rouletteBet = btn.dataset.rbet;
        renderModal();
      });
    });
    document.getElementById('roulette-lucky-num')?.addEventListener('change', (e) => {
      luckyNum = Math.max(0, Math.min(36, Math.floor(Number(e.target.value) || 0)));
      rouletteBet = 'number';
    });

    document.getElementById('btn-roulette-spin')?.addEventListener('click', () => {
      if (isSpinning) return;
      if (getBalance(currency) < stake || stake < 1) {
        uiManager.showToast(`Need at least ${fmtAmount(stake, currency)} to wager!`);
        return;
      }
      if (!debitStake(stake, currency)) return;
      isSpinning = true;
      rouletteResultHtml = '<span style="color:#fde047;">🎡 Wheel spinning across the drift table...</span>';
      renderModal();
      setTimeout(() => {
        if (uiManager.activeModal !== 'island_casino') return;
        isSpinning = false;
        const res = resolveRouletteSpin(rouletteBet, stake, currency, luckyNum);
        if (res.payout > 0) creditWinnings(res.payout, currency);
        const dot = res.color === 'green' ? '🟢' : res.color === 'red' ? '🔴' : '⚫';
        if (res.won) {
          soundManager?.playRareChime?.();
          rouletteResultHtml = `<strong style="color:#4ade80;">${dot} Pocket #${res.pocket} (${res.color.toUpperCase()})! Won ${fmtAmount(res.payout, currency)}!</strong>`;
        } else {
          soundManager?.playButtonClick?.();
          rouletteResultHtml = `<strong style="color:#f87171;">${dot} Pocket #${res.pocket} (${res.color.toUpperCase()}). Lost ${fmtAmount(stake, currency)}.</strong>`;
        }
        renderModal();
      }, 650);
    });

    document.getElementById('btn-bj-deal')?.addEventListener('click', () => {
      if (bjActive) return;
      if (getBalance(currency) < stake || stake < 1) {
        uiManager.showToast(`Need at least ${fmtAmount(stake, currency)} to deal!`);
        return;
      }
      if (!debitStake(stake, currency)) return;
      bjStake = stake;
      bjCurrency = currency;
      const deck = createShuffledDeck();
      const pCards = [deck.pop(), deck.pop()];
      const dCards = [deck.pop(), deck.pop()];
      const pEval = evaluateBlackjackHand(pCards);
      const dEval = evaluateBlackjackHand(dCards);
      if (pEval.isBlackjack || dEval.isBlackjack) {
        finishBlackjack(deck, pCards, dCards);
        return;
      }
      bjDeck = deck;
      bjPlayer = pCards;
      bjDealer = dCards;
      bjActive = true;
      bjStatusHtml = '<span style="color:#bae6fd;">Hit to draw another card, or Stand to hold!</span>';
      soundManager?.playButtonClick?.();
      renderModal();
    });

    document.getElementById('btn-bj-hit')?.addEventListener('click', () => {
      if (!bjActive) return;
      bjPlayer.push(bjDeck.pop());
      const pEval = evaluateBlackjackHand(bjPlayer);
      soundManager?.playButtonClick?.();
      if (pEval.isBust) {
        finishBlackjack(bjDeck, bjPlayer, bjDealer);
      } else if (pEval.total === 21) {
        while (evaluateBlackjackHand(bjDealer).total < 17 && bjDeck.length > 0) {
          bjDealer.push(bjDeck.pop());
        }
        finishBlackjack(bjDeck, bjPlayer, bjDealer);
      } else {
        renderModal();
      }
    });

    document.getElementById('btn-bj-stand')?.addEventListener('click', () => {
      if (!bjActive) return;
      while (evaluateBlackjackHand(bjDealer).total < 17 && bjDeck.length > 0) {
        bjDealer.push(bjDeck.pop());
      }
      finishBlackjack(bjDeck, bjPlayer, bjDealer);
    });

    document.getElementById('btn-bj-double')?.addEventListener('click', () => {
      if (!bjActive || bjPlayer.length !== 2) return;
      if (!debitStake(bjStake, bjCurrency)) return;
      bjStake *= 2;
      bjPlayer.push(bjDeck.pop());
      if (!evaluateBlackjackHand(bjPlayer).isBust) {
        while (evaluateBlackjackHand(bjDealer).total < 17 && bjDeck.length > 0) {
          bjDealer.push(bjDeck.pop());
        }
      }
      finishBlackjack(bjDeck, bjPlayer, bjDealer);
    });
  };

  uiManager._activeModalCleanup = () => {
    if (timerInterval) clearInterval(timerInterval);
  };
  uiManager.openModal("🏝️ Drift-Isle Casino — Captain Lucky", bodyHtml());
  bindEvents();

  timerInterval = setInterval(() => {
    if (uiManager.activeModal !== 'island_casino') {
      clearInterval(timerInterval);
      return;
    }
    const el = document.getElementById('casino-timer-text');
    if (el && islandState) {
      el.textContent = formatTimer(islandState.timer);
      if (!islandState.active || islandState.timer <= 0) {
        clearInterval(timerInterval);
        uiManager.showToast("🏝️ Captain Lucky's drift island faded back into the tide!");
        uiManager.closeModal();
      }
    }
  }, 1000);
}
