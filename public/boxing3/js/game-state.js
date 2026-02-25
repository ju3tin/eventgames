const game = {
    mode: null,         // 'ai', 'host', 'join'
    channel: null,
    arena: 0,
    character: 0,
  
    me: {
      x: 200,
      y: 400,
      health: 100,
      side: 'left',
      attacking: false,
      ducking: false
    },
  
    opponent: {
      x: 0,
      y: 400,
      health: 100,
      side: 'right',
      attacking: false,
      ducking: false
    },
  
    lastPunch: 0
  };