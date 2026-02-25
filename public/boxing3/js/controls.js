const keys = {};

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (k === 'a' || k === 'arrowleft')  game.me.x -= 8;
  if (k === 'd' || k === 'arrowright') game.me.x += 8;
  if (k === ' ') game.me.attacking = true;
  if (k === 'shift') game.me.ducking = true;
});

window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  keys[k] = false;

  if (k === 'shift') game.me.ducking = false;
});