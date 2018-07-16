$(document).ready(function() {
    console.log('The origin of the universe');

    var Corpuscle = function (m, x, y, z) {
        this.m = m;
        this.x = x;
        this.y = y;
        this.z = z;
        this.a = 0;
        this.inertion = {
            aX: 0,
            aY: 0,
            aZ: 0,
            vectorX: 0,
            vectorY: 0,
            vectorZ: 0
        };
    },
    Universe = function () {
        this.corpuscles = [];
        this.com = null;
        this.speed = 1;
        this.privateComs = [];
        this.add = function (m, x, y, z) {
            this.corpuscles.push(new Corpuscle(m, x ,y ,z));
            this.com = this.centerOfMass(this.corpuscles);
        };
        this.generate = function (count, size, maxWight) {
            for (var i = 0; i < count; i++) {
                this.add(parseInt(Math.random() * (maxWight) + 1, 10), parseInt(Math.random() * size, 10), parseInt(Math.random() * size, 10), 0);
            }

            this.com = this.centerOfMass(this.corpuscles);
        };
        this.centerOfMass = function (corpuscles) {
            var x_m_sum = 0,
                y_m_sum = 0,
                m_sum = 0,
                components = [];

            for (var i = 0; i < corpuscles.length; i++) {
                x_m_sum = x_m_sum + corpuscles[i].x * corpuscles[i].m;
                y_m_sum = y_m_sum + corpuscles[i].y * corpuscles[i].m;
                m_sum = m_sum + corpuscles[i].m;
                components.push(i);
            }

            return {x: x_m_sum / m_sum, y: y_m_sum / m_sum, m: m_sum, components: components};
        };
        this.permutations = [];
        this.permutation = function () {
            var self = this;
            const arr = this.corpuscles;
            const fn = (arr) => {
                if (arr.length === 1) {
                    return [arr];
                } else {
                    let subArr = fn(arr.slice(1));
                    return subArr.concat(subArr.map(e => e.concat(arr[0])), [[arr[0]]]);
                }
            };

            this.permutations = [];
            fn(arr).forEach(function(res){
                if (res.length > 1) {
                    self.permutations.push(res);
                }
            });
        };
        this.update = function () {
            this.permutation();
            this.privateComs = [];
            for (var i = 0; i < this.permutations.length; i++) {
                // if (this.corpuscles.length !== 2 && this.permutations[i].length === this.corpuscles.length) {
                //     continue;
                // }
                this.privateComs.push(this.centerOfMass(this.permutations[i]));
            }
            this.com = this.centerOfMass(this.corpuscles);

            for (i = 0; i < this.corpuscles.length; i++) {
                for (var j = 0; j < this.privateComs.length; j++) {
                    if (!(i in this.privateComs[j].components)) {
                        continue;
                    }

                    var com = this.privateComs[j],
                        rx = Math.abs(this.corpuscles[i].x - com.x),
                        ry = Math.abs(this.corpuscles[i].y - com.y),
                        r = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));

                    // if (r < this.corpuscles[i].m * 10) {
                    //     continue;
                    // }

                    var F = (com.m - this.corpuscles[i].m) / (Math.pow(r, 2) * this.corpuscles[i].m) / r;

                    this.corpuscles[i].inertion.vectorX = (100 - (100 * ry / r)) / 100;
                    this.corpuscles[i].inertion.vectorY = (100 - (100 * rx / r)) / 100;

                    if (this.corpuscles[i].x < com.x) {
                        this.corpuscles[i].inertion.aX = this.corpuscles[i].inertion.aX + F;
                    } else if (this.corpuscles[i].x > com.x) {
                        this.corpuscles[i].inertion.aX = this.corpuscles[i].inertion.aX - F;
                    }

                    if (this.corpuscles[i].y < com.y) {
                        this.corpuscles[i].inertion.aY = this.corpuscles[i].inertion.aY + F;
                    } else if (this.corpuscles[i].y > com.y) {
                        this.corpuscles[i].inertion.aY = this.corpuscles[i].inertion.aY - F;
                    }
                }
                this.corpuscles[i].x = this.corpuscles[i].x + this.corpuscles[i].inertion.aX * this.corpuscles[i].inertion.vectorX * this.speed;
                this.corpuscles[i].y = this.corpuscles[i].y + this.corpuscles[i].inertion.aY * this.corpuscles[i].inertion.vectorY * this.speed;
            }

            // this.com = this.centerOfMass(this.corpuscles);
        };
        this.render = function (canvas, renderCenterOfMass) {
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < this.corpuscles.length; i++) {
                ctx.fillStyle = "#ffffff";
                var radius = this.corpuscles[i].m / 2;
                if (radius > 5) {
                    radius = 5;
                }
                ctx.fillRect(this.corpuscles[i].x - radius, this.corpuscles[i].y - radius, radius * 2, radius * 2);
                ctx.fillStyle = "#00ff00";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(this.corpuscles[i].m, this.corpuscles[i].x, this.corpuscles[i].y);
            }

            if (renderCenterOfMass === true) {
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(this.com.x - 5, this.com.y - 5, 10, 10);
                ctx.fillStyle = "#00ff00";
                ctx.fillText(this.com.m, this.com.x, this.com.y);
                //
                // ctx.strokeStyle = "#00ff00";
                // ctx.beginPath();
                // for (i = 0; i < this.corpuscles.length; i++) {
                //     ctx.strokeWidth = this.corpuscles[i].m;
                //     ctx.moveTo(this.com.x, this.com.y);
                //     ctx.lineTo(this.corpuscles[i].x, this.corpuscles[i].y);
                // }
                // ctx.stroke();

                for (i = 0; i < this.privateComs.length; i++) {
                    ctx.fillStyle = "#ffff00";
                    ctx.fillRect(this.privateComs[i].x, this.privateComs[i].y, 3, 3);
                    ctx.fillStyle = "#00ff00";
                    ctx.fillText(this.privateComs[i].m, this.privateComs[i].x, this.privateComs[i].y);
                }
            }
        };
        this.run = function (interval, renderCenterOfMass) {
            var canvas = document.getElementById('world'),
                self = this;

            setInterval(function () {
                self.render(canvas, renderCenterOfMass);
                self.update();
            }, interval);
        }
    },
    world = new Universe();

    console.log('Universe ready for build');
    world.generate(4, 600, 100);
    //
    // world.add(12, 50, 200, 0);
    // world.add(26, 350, 300, 0);
    // world.add(18, 150, 250, 0);

    world.speed = 1000;
    world.run(10, true);
});