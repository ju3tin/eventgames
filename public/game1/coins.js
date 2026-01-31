coinGroup = [];

function addCoin(x,z){
  var geometry = new THREE.CylinderGeometry( 0.3, 0.3, 0.1, 30, true );
  var material = new THREE.MeshPhongMaterial( {color: 0xffff00} );
  var cylinder = new THREE.Mesh( geometry, material );
  cylinder.receiveShadow = true;
  cylinder.castShadow = true;
  cylinder.rotation.x += Math.PI/2;
  cylinder.position.x = x;
  cylinder.position.z = z;
  cylinder.position.y += 0.5;
  coinGroup.push(cylinder);
}
