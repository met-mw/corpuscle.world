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
        this.slowing = 1;
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

            for (i = 0; i < this.corpuscles.length; i++) {
                for (var j = 0; j < this.privateComs.length; j++) {
                    if (!(i in this.privateComs[j].components)) {
                        continue;
                    }

                    // var alreadyUsed = false;
                    // for (var k = i; k >= 0; k--) {
                    //     if (!(i in this.privateComs[j].components)) {
                    //
                    //     }
                    // }

                    var com = this.privateComs[j],
                        rx = Math.abs(this.corpuscles[i].x - com.x),
                        ry = Math.abs(this.corpuscles[i].y - com.y),
                        r = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));

                    if (r < this.corpuscles[i].m * 2) {
                        continue;
                    }

                    var F = com.m * this.corpuscles[i].m / (Math.pow(r, 2) * this.corpuscles[i].m) / r;

                    if (rx > ry) {
                        this.corpuscles[i].inertion.vectorX = 1;
                        this.corpuscles[i].inertion.vectorY = rx / 10000 * ry;
                    } else if (rx < ry) {
                        this.corpuscles[i].inertion.vectorX = ry / 10000 * rx;
                        this.corpuscles[i].inertion.vectorY = 1;
                    } else {
                        this.corpuscles[i].inertion.vectorX = 1;
                        this.corpuscles[i].inertion.vectorY = 1;
                    }

                    if (this.corpuscles[i].x < com.x) {
                        this.corpuscles[i].inertion.aX = this.corpuscles[i].inertion.aX + F * this.corpuscles[i].inertion.vectorX;
                    } else if (this.corpuscles[i].x > com.x) {
                        this.corpuscles[i].inertion.aX = this.corpuscles[i].inertion.aX - F * this.corpuscles[i].inertion.vectorX;
                    }

                    if (this.corpuscles[i].y < com.y) {
                        this.corpuscles[i].inertion.aY = this.corpuscles[i].inertion.aY + F * this.corpuscles[i].inertion.vectorY;
                    } else if (this.corpuscles[i].y > com.y) {
                        this.corpuscles[i].inertion.aY = this.corpuscles[i].inertion.aY - F * this.corpuscles[i].inertion.vectorY;
                    }
                }

                this.corpuscles[i].x = this.corpuscles[i].x + this.corpuscles[i].inertion.aX * (1 / this.slowing);
                this.corpuscles[i].y = this.corpuscles[i].y + this.corpuscles[i].inertion.aY * (1 / this.slowing);
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
                // ctx.textAlign = "center";
                // ctx.textBaseline = "bottom";
                // ctx.fillStyle = "#ff0000";
                // ctx.fillRect(this.com.x - 5, this.com.y - 5, 10, 10);
                // ctx.fillStyle = "#00ff00";
                // ctx.fillText(this.com.m, this.com.x, this.com.y);
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
    world.generate(10, 600, 50);
    // world.add(10, 290, 300, 0);
    // world.add(2, 310, 300, 0);
    // world.add(4, 150, 200, 0);
    // world.add(4, 250, 300, 0);
    // world.add(4, 350, 400, 0);
    // world.add(4, 450, 500, 0);

    world.slowing = 1;
    world.run(10, true);
});