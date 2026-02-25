const ui = {
    currentScreen: 'start',
  
    showStart() {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('start-screen').classList.remove('hidden');
    },
  
    showArenaSelect() {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('arena-screen').classList.remove('hidden');
    },
  
    showCharacterSelect() {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('character-screen').classList.remove('hidden');
    },
  
    showGame() {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      document.getElementById('game-container').classList.remove('hidden');
    },
  
    showJoin() {
      document.getElementById('join-input').classList.remove('hidden');
    },
  
    async start(mode) {
      game.mode = mode;
      if (mode === 'host') {
        game.channel = 'box-' + Math.random().toString(36).slice(2, 10);
        document.getElementById('room-code-display').textContent = game.channel;
        document.getElementById('share-section').classList.remove('hidden');
      } else if (mode === 'join') {
        // handled in joinRoom()
      }
      this.showArenaSelect();
    },
  
    selectArena(index) {
      game.arena = index;
      this.showCharacterSelect();
    },
  
    selectCharacter(index) {
      game.character = index;
      startGame();
    },
  
    async joinRoom() {
      const code = document.getElementById('room-code').value.trim();
      if (!code) return alert("Enter room code");
      game.channel = code;
      this.showArenaSelect();
    }
  };
  
  // Copy room code helper
  document.getElementById('copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(game.channel);
    alert('Room code copied!');
  });