AFRAME.registerComponent('multiverse', {
    schema: {
        min: {type:'number', default:120}
        
    },
    init: function(){
        const plane1 = {x1:-2, x2:4, y1:0, y2:4, z1:0, z2:0};
        const baseTris=[];
        this.triangles=[];
        if(!plane1.x1 && !plane1.x2){
            console.log("x=0")
            baseTris.push({p1: new THREE.Vector3(0,4, -2), p2:new THREE.Vector3(0,0, -2), p3:new THREE.Vector3(0,0,2)})
            baseTris.push({p1:new THREE.Vector3(0,4, -2), p2:new THREE.Vector3(0,0,2), p3:new THREE.Vector3(0,4,2)})
        }
        else if(!plane1.z1 && !plane1.z2){
            console.log("z=0")
            baseTris.push({p1: new THREE.Vector3(-2,4, 0), p2:new THREE.Vector3(-2,0, 0), p3:new THREE.Vector3(2,0,0)})
            baseTris.push({p1:new THREE.Vector3(-2,4, 0), p2:new THREE.Vector3(2,0,0), p3:new THREE.Vector3(2,4,0)})
        }
        baseTris.forEach(triangle => {
           this.decompose(triangle);
        });

        this.drawTriangles(this.triangles);
        console.log(this.triangles)
    },
    drawTriangles:function(triangles){
        const scene = document.querySelector("a-scene");
        triangles.forEach(triangle => {
            const el = document.createElement("a-entity");
            const triangleMesh = this.createPrism([triangle.p1, triangle.p2, triangle.p3],0.1);
            triangleMesh.position.set(0,0,0);
            const mid = new THREE.Vector3();
            new THREE.Triangle(triangle.p1, triangle.p2, triangle.p3).getMidpoint(mid);
            el.object3D.position.x = mid.x/128;
            el.object3D.position.y = mid.y/32;
            el.object3D.position.z = mid.z/32;
            el.setObject3D('mesh', triangleMesh);
            triangleMesh.updateMatrix();
            scene.appendChild(el);
        });
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
                this.decompose({p1: triangle.p1, p2:center, p3: triangle.p3})
                this.decompose({p1: center, p2:triangle.p2, p3: triangle.p3})
            }
            else if(triangle.p2.distanceToSquared(triangle.p3) > triangle.p2.distanceToSquared(triangle.p1) && triangle.p2.distanceToSquared(triangle.p3) > triangle.p3.distanceToSquared(triangle.p1)){
                const line = new THREE.Line3(triangle.p2, triangle.p3);
                const center = new THREE.Vector3();
                line.getCenter(center);
                this.decompose({p1: triangle.p1, p2:triangle.p3, p3: center})
                this.decompose({p1: center, p2:triangle.p3, p3: triangle.p1})
            }
            else{
                const line = new THREE.Line3(triangle.p1, triangle.p3);
                const center = new THREE.Vector3();
                line.getCenter(center);
                this.decompose({p1: triangle.p1, p2:triangle.p2, p3: center})
                this.decompose({p1: triangle.p2, p2:triangle.p3, p3: center})
            }
        }

    },
    area:function(triangle){
        console.log(triangle.p3)
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
        const material1 = new THREE.MeshBasicMaterial({color:0xff0000, side: THREE.DoubleSide});
        const Texture = loader.load("cat.jpg", texture => {
            material1.map = texture;
            material1.needsUpdate = true;
        });
        Texture.wrapS = Texture.wrapT = THREE.RepeatWrapping;
        Texture.repeat.set(0.2,0.2);     

        
        const material2 = new THREE.MeshBasicMaterial({color: 0x00ff00,side: THREE.DoubleSide});

        const materials = [
            material1,
            material2];

        return new THREE.Mesh(geometry,materials);     
    }
})