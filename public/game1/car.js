car = new THREE.Group();
function drawCar(){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("models/raceCarOrange.mtl", function(materials){
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("models/raceCarOrange.obj", function(mesh){

      mesh.traverse(function(node){
        if(node instanceof THREE.Mesh){
          node.castShadow = true;
          node.receiveShadow = true;
        }
      })
      mesh.position.z -= 2;
      mesh.rotation.y = Math.PI;
      mesh.scale.set(1.6,2.1,1.6);
      car.add(mesh);
    })
  })
}

function drawEnemy(){
  var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load("models/raceCarGreen.mtl", function(materials){
      materials.preload();
      var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);

      objLoader.load("models/raceCarGreen.obj", function(mesh){

        mesh.traverse(function(node){
          if(node instanceof THREE.Mesh){
            node.castShadow = true;
            node.receiveShadow = true;
          }
        })
        mesh.position.z -= 5;
        mesh.rotation.y = Math.PI;
        mesh.scale.set(2,2.5,1.6);
        scene.add(mesh);
      })
    })
}
