var meshFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 35),
  new THREE.MeshPhongMaterial({color:0x7a7a52, wireframe:false})
);
meshFloor.rotation.x -= Math.PI / 2;
meshFloor.receiveShadow = true;

roadGroup = [];
function drawRoad(x,z){

  var textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("images/ground_asphalt_synth_11.png");

  var road = new THREE.Mesh(
    new THREE.PlaneGeometry(1,1),
    new THREE.MeshPhongMaterial({
      map: texture,
    })
  );
  road.position.x= x;
  road.position.z= z;
  road.position.y += 0.01;
  road.rotation.x -= Math.PI / 2;
  road.scale.set(2,3.35,1);
  road.receiveShadow = true;
  road.castShadow = true;
  roadGroup.push(road);
}
