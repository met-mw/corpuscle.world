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
        this.add = function (m, x, y, z) {
            this.corpuscles.push(new Corpuscle(m, x ,y ,z));
            this.com = this.centerOfMass(this.corpuscles);
        };
        this.generate = function (count, size, maxWight) {
            for (var i = 0; i < count; i++) {
                this.add(parseInt(Math.random() * (maxWight - 1) + 1, 10), parseInt(Math.random() * size, 10), parseInt(Math.random() * size, 10), 0);
            }

            this.com = this.centerOfMass(this.corpuscles);
        };
        this.centerOfMass = function (corpuscles) {
            var x_m_sum = 0,
                y_m_sum = 0,
                m_sum = 0;

            for (var i = 0; i < corpuscles.length; i++) {
                x_m_sum = x_m_sum + corpuscles[i].x * corpuscles[i].m;
                y_m_sum = y_m_sum + corpuscles[i].y * corpuscles[i].m;
                m_sum = m_sum + corpuscles[i].m;
            }

            return {x: x_m_sum / m_sum, y: y_m_sum / m_sum, m: m_sum};
        };

        this.update = function () {
            for (var i = 0; i < this.corpuscles.length; i++) {
                var depthOfParticularCase = 0;
                while (depthOfParticularCase <= this.corpuscles.length) {
                    console.log(depthOfParticularCase);
                    var com = this.centerOfMass(this.corpuscles.slice(0, this.corpuscles.length - 1 - depthOfParticularCase)),
                        rx = Math.abs(this.corpuscles[i].x - com.x),
                        ry = Math.abs(this.corpuscles[i].y - com.y),
                        r = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2)),
                        F = this.corpuscles[i].m * com.m / Math.pow(r, 2) * r;

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
                        this.corpuscles[i].inertion.aX = this.corpuscles[i].inertion.aX + F * this.corpuscles[i].m * this.corpuscles[i].inertion.vectorX;
                    } else if (this.corpuscles[i].x > com.x) {
                        this.corpuscles[i].inertion.aX = this.corpuscles[i].inertion.aX - F * this.corpuscles[i].m * this.corpuscles[i].inertion.vectorX;
                    }

                    if (this.corpuscles[i].y < com.y) {
                        this.corpuscles[i].inertion.aY = this.corpuscles[i].inertion.aY + F * this.corpuscles[i].m * this.corpuscles[i].inertion.vectorY;
                    } else if (this.corpuscles[i].y > com.y) {
                        this.corpuscles[i].inertion.aY = this.corpuscles[i].inertion.aY - F * this.corpuscles[i].m * this.corpuscles[i].inertion.vectorY;
                    }

                    depthOfParticularCase++;
                }

                this.corpuscles[i].x = this.corpuscles[i].x + this.corpuscles[i].inertion.aX / this.slowing;
                this.corpuscles[i].y = this.corpuscles[i].y + this.corpuscles[i].inertion.aY / this.slowing;
            }

            this.com = this.centerOfMass(this.corpuscles);
        };
        this.render = function (canvas, renderCenterOfMass) {
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#ffffff";
            for (var i = 0; i < this.corpuscles.length; i++) {
                ctx.fillRect(this.corpuscles[i].x, this.corpuscles[i].y, 10, 10);
            }

            if (renderCenterOfMass === true) {
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(this.com.x, this.com.y, 10, 10);
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
    world.generate(10, 600, 2);
    console.log(world);

    world.slowing = 10;
    world.run(10, true);
});