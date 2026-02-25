async function initPubNub() {
    pubnub.subscribe({ channels: [game.channel] });
  
    pubnub.addListener({
      message: (m) => {
        if (m.publisher !== pubnub.getUserId()) {
          game.opponent.x = m.message.x;
          game.opponent.y = m.message.y;
          game.opponent.attacking = m.message.attacking;
          game.opponent.ducking = m.message.ducking;
          game.opponent.health = m.message.health;
          updateHealth();
          checkHit();
        }
      }
    });
  }
  
  function syncState() {
    if (!game.channel) return;
    pubnub.publish({
      channel: game.channel,
      message: {
        x: game.me.x,
        y: game.me.y,
        attacking: game.me.attacking,
        ducking: game.me.ducking,
        health: game.me.health
      }
    });
  }