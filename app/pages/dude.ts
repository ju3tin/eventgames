export default function handler(req, res) {
  if (req.method === 'GET') {
    const characters = [
  { id: 'xiaoyu', name: 'Xiaoyu', portrait: '/characters/xiaoyu.png', model: '/models/black_girl_avatar.glb', animelist: '/anime/1.glb' },
  { id: 'julia', name: 'Julia', portrait: '/characters/julia.png', model: '/models/123.glb', animelist: '/anime/1.glb'  },
  { id: 'ryu', name: 'Ryu', portrait: '/characters/ryu.png', model: '/models/ryu.glb', animelist: '/anime/1.glb'  },
  { id: 'ken', name: 'Ken', portrait: '/characters/ken.png', model: '/models/ninja2.glb', animelist: '/anime/1.glb'  },
  { id: 'chunli', name: 'Chun-Li', portrait: '/characters/ChunLi.png', model: '/models/chun_li.glb', animelist: '/anime/1.glb'  },
  { id: 'guile', name: 'Guile', portrait: '/characters/Guile.png', model: '/models/urbanninja.glb', animelist: '/anime/1.glb'  },
  { id: 'anna', name: 'Anna', portrait: '/characters/anna.png', model: '/models/sitting_talking.glb', animelist: '/anime/1.glb'  },
  { id: 'xBot', name: 'Anna', portrait: '/characters/anna.png', model: '/models/sitting_talking.glb', animelist: '/anime/1.glb'  },
  { id: 'blanka', name: 'Blanka', portrait: '/characters/Super_Blanka.png', model: '/anime/1a.glb', animelist: '/anime/1a.glb'  },
    ];
    
    res.status(200).json(characters);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}