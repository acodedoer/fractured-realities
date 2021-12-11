AFRAME.registerComponent('multiverse', {
    schema: {
        min: {type:'number', default:123}    
    },
    init: function(){
        this.counter=0;
        const plane = {P1: new THREE.Vector3(-2,4,-2), P2: new THREE.Vector3(-2,0,-2), P3: new THREE.Vector3(2,0,-2),P4: new THREE.Vector3(2,4,-2)};
        this.images=[];
        let baseTris=[];
        this.triangles=[];
        const rotations=[[0,0,0],[0,180, 0], [0, 90, 0], [0, -90, 0]]
        const positions=[[0,0,-2],[0,0, 2], [-2, 0, 0], [2, 0, 0]]
        fetch('https://www.reddit.com/r/cats.json')
            .then(res=>res.json())
            .then(res=>res.data.children)
            .then(res=>res.map(post=>({
                url: post.data.url
              })))
            .then(res=> 
                {
                    this.images = Object.values(res); 
                    console.log(this.images)
                    for(let i =0; i<4; i++){
                        baseTris.push({p1: plane.P1, p2:plane.P2, p3:plane.P3})
                        baseTris.push({p1:plane.P1, p2:plane.P3, p3:plane.P4})
                        baseTris.forEach(triangle => {
                        this.decompose(triangle);
                        });
                        this.drawTriangles(this.triangles, rotations[i], positions[i]);
                        this.triangles=[];
                        baseTris=[];
                    }
                })
    },
    drawTriangles:function(triangles, rotations=[0,0,0], positions=[0,0,0]){
        const scene = document.querySelector("a-scene");
        const parent = document.createElement("a-entity");
        triangles.forEach(triangle => {
            const el = document.createElement("a-entity");
            const triangleMesh = this.createPrism([triangle.p1, triangle.p2, triangle.p3],0.01);
            el.object3D.position.x =triangle.p1.x
            el.object3D.position.y =triangle.p1.y
            el.object3D.position.z =triangle.p1.z+2
            el.object3D.attach(triangleMesh);
            el.setAttribute("prism","")
            triangleMesh.updateMatrix();
            parent.appendChild(el);
        });
        parent.setAttribute("rotation",`${rotations[0]} ${rotations[1]} ${rotations[2]}`);
        parent.setAttribute("position",`${positions[0]} ${positions[1]} ${positions[2]}`);
        scene.appendChild(parent)
    },

    decompose: function(triangle){
        
        if (this.area(triangle)<16/this.data.min){
            this.triangles.push(triangle);
            return
        }
        else{
            if(triangle.p1.distanceToSquared(triangle.p2) > triangle.p2.distanceToSquared(triangle.p3) && triangle.p1.distanceToSquared(triangle.p2) > triangle.p3.distanceToSquared(triangle.p1)){
                const line = new THREE.Line3(triangle.p1, triangle.p2);
                const center = new THREE.Vector3();
                line.getCenter(center);
                this.decompose({p1: triangle.p1, p2:center, p3: triangle.p3},1)
                this.decompose({p1: center, p2:triangle.p2, p3: triangle.p3},1)
            }
            else if(triangle.p2.distanceToSquared(triangle.p3) > triangle.p2.distanceToSquared(triangle.p1) && triangle.p2.distanceToSquared(triangle.p3) > triangle.p3.distanceToSquared(triangle.p1)){
                const line = new THREE.Line3(triangle.p2, triangle.p3);
                const center = new THREE.Vector3();
                line.getCenter(center);
                this.decompose({p1: triangle.p1, p2:triangle.p2, p3: center},2)
                this.decompose({p1: center, p2:triangle.p3, p3: triangle.p1},2)
            }
            else{
                const line = new THREE.Line3(triangle.p1, triangle.p3);
                const center = new THREE.Vector3();
                line.getCenter(center);
                this.decompose({p1: triangle.p1, p2:triangle.p2, p3: center},3)
                this.decompose({p1: triangle.p2, p2:triangle.p3, p3: center},3)
            }
        }

    },
    area:function(triangle){
        const tri = new THREE.Triangle(triangle.p1, triangle.p2, triangle.p3);
        return tri.getArea(); 
    },
    createPrism: function(vertices, depth){
        const shape = new THREE.Shape();
        shape.moveTo(vertices[0].x, vertices[0].y);
        for (let i=1; i < vertices.length; i++) {
            shape.lineTo( vertices[i].x, vertices[i].y );
        }
        shape.moveTo(vertices[0].x, vertices[0].y);

        const extrudeSettings = {
            steps: 1,
            depth: depth,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 0,
            material:0
        };

        const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        const loader = new THREE.TextureLoader();
        loader.crossOrigin=''
        const material1 = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
        const Texture = loader.load(this.images[7].url, texture => {
            material1.map = texture;
            material1.needsUpdate = true;
        });
        Texture.wrapS = Texture.wrapT = THREE.RepeatWrapping;
        Texture.repeat.set(0.015625 * (this.data.min+1),0.015625 * (this.data.min+1));     

        
        const material2 = new THREE.MeshBasicMaterial({map: Texture,side: THREE.DoubleSide});

        const materials = [
            material1,
            material2];

        return new THREE.Mesh(geometry,materials);     
    }
})

AFRAME.registerComponent('prism', {
    init: function(){
        const randz = Math.random() * 20;
        const randx = Math.random() * 25;
        this.alpha = Math.random() * 2*Math.PI;
        this.beta = Math.random() * 2*Math.PI;
        this.theta = Math.random() * 2*Math.PI;
        this.rotationSpeed = Math.random();

        this.el.object3D.position.z = -randz - 2;
        this.el.object3D.position.x = randx -4;
        this.el.object3D.rotation.x = this.alpha;
        this.el.object3D.rotation.y = this.beta;
        this.el.object3D.rotation.z = this.theta;
    },
    tick(d, dt){
       // this.el.object3D.rotation.x += dt/1000 * this.rotationSpeed;
        this.el.object3D.rotation.y += dt/1000 * this.rotationSpeed;;
        //this.el.object3D.rotation.z += dt/1000 * this.rotationSpeed;;
    }
})