wallGroup = [];
function drawWall(x,z,side){

  var textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("images/Hex_glow_emissive.png");

  var wall = new THREE.Mesh(
    new THREE.PlaneGeometry(5,5),
    new THREE.MeshPhongMaterial({
      map: texture,
    })
  );
  wall.rotation.y -= Math.PI/2 * side;
  wall.position.x= x;
  wall.position.z= z;
  wall.scale.set(2,1.5,1);
  wall.receiveShadow = true;
  wall.castShadow = true;
  wallGroup.push(wall);
}
