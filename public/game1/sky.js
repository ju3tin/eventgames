var textureLoader = new THREE.TextureLoader();
    skyTexture = textureLoader.load("images/minimal-neon-city-fireworks.png");

var sky = new THREE.Mesh(
  new THREE.PlaneGeometry(3350, 1900),
  new THREE.MeshBasicMaterial({color:0xff5555,
    map:skyTexture})
);
sky.rotation.x = Math.PI
sky.rotation.z = Math.PI
sky.position.z += 990;
sky.position.y += 400;
