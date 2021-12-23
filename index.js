AFRAME.registerComponent('multiverse', {
    schema: {
        min: {type:'number', default:511}    
    },
    init: function(){
        this.repeatRatio = 4;
        this.canvases=[];
        const config = {
            src: './assets/open-peeps-sheet1.png',
            rows: 7,
            cols: 15,
            width: 1800,
            height: 840
        }

        this.counter=0;
        const plane = {P1: new THREE.Vector3(-2,4,-2), P2: new THREE.Vector3(-2,0,-2), P3: new THREE.Vector3(2,0,-2),P4: new THREE.Vector3(2,4,-2)};
        this.images=[];
        let baseTris=[];
        this.triangles=[];
        const rotations=[[0,0,0],[0,180, 0], [0, 90, 0], [0, -90, 0]]
        const positions=[[0,0,-2],[0,0, 2], [-2, 0, 0], [2, 0, 0]]

        const source = document.createElement('img');
        source.src=config.src;
        source.crossOrigin="Anonymous"
        source.onload = ()=> {
            const x = config.width/config.cols;
            const y = config.height/config.rows;
            let currentImageX=0
            let currentImageY=0
            let counter =0;
            for(let i = 0; i<config.rows; i++){
                for(let j =0; j<config.cols;j++){
                    this.canvases[counter]= document.createElement('canvas');
                    this.canvases[counter].width=x;
                    this.canvases[counter].height=y;
                    const context = this.canvases[counter].getContext('2d')
                    context.drawImage(source, currentImageX, currentImageY);
                    currentImageX-=x;
                    counter+=1;
                }
                currentImageX=0;
                currentImageY-=y;
                console.log(counter)
            }
            

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
        };
    },

    drawTriangles:function(triangles, rotations=[0,0,0], positions=[0,0,0]){
        const scene = document.querySelector("a-scene");
        const parent = document.createElement("a-entity");
        triangles.forEach(triangle => {
            const el = document.createElement("a-entity");
            const triangleMesh = this.createPrism([triangle[0].p1, triangle[0].p2, triangle[0].p3],triangle[1],0.01);
            el.object3D.position.x =triangle[0].p1.x
            el.object3D.position.y =triangle[0].p1.y
            el.object3D.position.z =triangle[0].p1.z+2
            el.object3D.attach(triangleMesh);
            el.setAttribute("prism","")
            triangleMesh.updateMatrix();
            parent.appendChild(el);
        });
        parent.setAttribute("rotation",`${rotations[0]} ${rotations[1]} ${rotations[2]}`);
        parent.setAttribute("position",`${positions[0]} ${positions[1]} ${positions[2]}`);
        scene.appendChild(parent)
    },

    decompose: function(triangle, type=0){
        type=0;
        let xflip = 1;
        let yflip =1;
        if (this.area(triangle)<16/this.data.min){
            console.log("Out");
            if(triangle.p1.distanceToSquared(triangle.p2) > triangle.p2.distanceToSquared(triangle.p3) && triangle.p1.distanceToSquared(triangle.p2) > triangle.p3.distanceToSquared(triangle.p1)){
                console.log("Top");
                const line = new THREE.Line3(triangle.p1, triangle.p2);
                const center = new THREE.Vector3();
                line.getCenter(center);
                if(center.y>triangle.p3.y) {
                    yflip = -1;
                }
                if(center.x>triangle.p3.x){
                    xflip= -1;
                }
            }
            else if(triangle.p2.distanceToSquared(triangle.p3) > triangle.p2.distanceToSquared(triangle.p1) && triangle.p2.distanceToSquared(triangle.p3) > triangle.p3.distanceToSquared(triangle.p1)){
                console.log("Mid");
                const line = new THREE.Line3(triangle.p2, triangle.p3);
                const center = new THREE.Vector3();
                line.getCenter(center);
                if(center.y>triangle.p1.y) {
                    yflip = -1;
                }
                if(center.x>triangle.p1.x){
                    xflip= -1;
                }
            }
            else{
                console.log("Bottom");
                const line = new THREE.Line3(triangle.p1, triangle.p3);
                const center = new THREE.Vector3();
                line.getCenter(center);
                if(center.y>triangle.p2.y) {
                    yflip = -1;
                }
                if(center.x>triangle.p2.x){
                    xflip= -1;
                }
            }

            console.log("None");
            this.triangles.push([triangle,[xflip,yflip]]);
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
    createPrism: function(vertices,type, depth){
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

        let a, b, c,s;
        a = vertices[0].distanceTo(vertices[1]);
        b = vertices[1].distanceTo(vertices[2]);
        c = vertices[2].distanceTo(vertices[0]);
        s=(a+b+c)/2;
        let ar = (a*b*c)/(8*(s-a)*(s-b)*(s-c));
        
        var texture = new THREE.Texture(this.canvases[Math.floor(Math.random() * 103)]);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(this.repeatRatio,this.repeatRatio);  
       
        



        // var texture = new THREE.Texture(this.canvases[Math.floor(Math.random() * 103)]);
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(0.7, 0.7);  
        // texture.repeat.x = 0.7;
        // texture.repeat.y =0.7;
        // texture.offset.x = ((ar/this.area)-1)/2 *-1
        // texture.needsUpdate = true;

        var material;
       
        const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        const material1 = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
        material= new THREE.MeshBasicMaterial({
            map : texture,
            color:"gray"
        });
        if(type[0]==-1&&type[1]==-1){
            texture.repeat.set(-this.repeatRatio,-this.repeatRatio);  
            material= new THREE.MeshBasicMaterial({
                map : texture,
                color:"green"
            });
        }
        else if(type[0]==-1){
            texture.repeat.set(-this.repeatRatio,this.repeatRatio);  
            material= new THREE.MeshBasicMaterial({
                map : texture,
                color:"red"
            });
        }
        else if(type[1]==-1){
            texture.repeat.set(this.repeatRatio,-this.repeatRatio);  
            material= new THREE.MeshBasicMaterial({
                map : texture,
                color:"yellow"
            });
        }

        
        // if(type==2){
        //     material= new THREE.MeshBasicMaterial({
        //         map : texture,
        //         color:"blue"
        //     });
        // }
        // if(type==3){
        //     material= new THREE.MeshBasicMaterial({
        //         map : texture,
        //         color:"green"
        //     });
        // }

        // if(vertices[2].y==vertices[1].y ){
        //     material= new THREE.MeshBasicMaterial({
        //         map : texture,
        //         color:"green"
        //     });
        //     //texture.offset.x = ar-1
        // }

        // else if(vertices[0].x==vertices[1].x || vertices[1].x == vertices[2].x){
        //     material= new THREE.MeshBasicMaterial({
        //         map : texture,
        //         color:"yellow"
        //     });
        //     //texture.offset.y = ar+1
        // }
        texture.needsUpdate = true;
        const material2 = new THREE.MeshBasicMaterial({map: texture,side: THREE.DoubleSide});

        const materials = [
            material,
            material
        ];

        const x = new THREE.Mesh(geometry,materials);  

        return x   
    }
})

AFRAME.registerComponent('prism', {
    init: function(){
        const randz = Math.random() *20;
        const randx = Math.random() * 25;
        this.alpha = Math.random() * 2*Math.PI;
        this.beta = Math.random() * 2*Math.PI;
        this.theta = Math.random() * 2*Math.PI;
        this.rotationSpeed = Math.random();
        this.el.object3D.position.z = randz- 0.5 ;
        this.el.object3D.position.x = randx -4;
        this.el.object3D.rotation.x = this.alpha;
        this.el.object3D.rotation.y = this.beta;
        this.el.object3D.rotation.z = this.theta;
    },
    tick(d, dt){
       this.el.object3D.rotation.x += dt/1000 * this.rotationSpeed;
        this.el.object3D.rotation.y += dt/1000 * this.rotationSpeed;
        this.el.object3D.rotation.z += dt/1000 * this.rotationSpeed;
    }
})