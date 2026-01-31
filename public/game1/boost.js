boots = new THREE.Group();
function drawBoots(){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/pylon.mtl", function(materials){
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("models/pylon.obj", function(mesh){

      mesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
          node.receiveShadow = true;
        }
      })
      mesh.position.y = 0.2;
      mesh.rotation.y -= Math.PI/2;
      mesh.scale.set(6,6,6);
      boots.add(mesh);
    })
  })
}

fBoost = new THREE.Group();
function drawFlyingBoost(){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/roadRampLongWall.mtl", function(materials){
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("models/roadRampLongWall.obj", function(mesh){

      mesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
          node.receiveShadow = true;
        }
      })
      mesh.position.z = -1.8;
      mesh.position.x = 2;
      //mesh.rotation.y -= Math.PI/2;
      mesh.scale.set(1.8,1.4,0.2);
      fBoost.add(mesh);
    })
  })
}

cBoost = new THREE.Group();
function drawCoinsBoost(){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/radarEquipment.mtl", function(materials){
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("models/radarEquipment.obj", function(mesh){

      mesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
          node.receiveShadow = true;
        }
      })
      mesh.position.z = 2;
      mesh.position.x = 2;
      //mesh.rotation.y -= Math.PI/2;
      mesh.scale.set(1.8,1.4,1.8);
      cBoost.add(mesh);
    })
  })
}
