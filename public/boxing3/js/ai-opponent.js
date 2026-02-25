function updateAI() {
    if (game.mode !== 'ai') return;
  
    const dx = game.me.x - game.opponent.x;
    game.opponent.x += dx > 0 ? 4 : -4;
  
    if (Math.abs(dx) < 150 && Math.random() < 0.04) {
      game.opponent.attacking = true;
      checkHit();
      setTimeout(() => game.opponent.attacking = false, 400);
    }
  }