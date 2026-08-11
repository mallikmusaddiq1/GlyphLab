function expPNG() {
    var e = currentDetailExportData,
        t = Object.keys(e.items),
        cD = document.createElement("canvas").getContext("2d");
    cD.font = "bold 96px sans-serif";
    var r = {},
        l = [],
        i = 1920;
    t.forEach(function(t) {
        var a = String(e.items[t]),
            o = [],
            n = a.split(" ");
        n.forEach(function(e) {
            if (e.length > 38) {
                for (var t = 0; t < e.length; t += 38) o.push(e.substr(t, 38));
            } else o.push(e);
        });
        var s = "",
            c = [];
        o.forEach(function(e, t) {
            var ts = s + e + " ";
            if (cD.measureText(ts).width > 2800 && t > 0) {
                c.push(s);
                s = e + " ";
            } else {
                s = ts;
            }
        });
        c.push(s);
        r[t] = c;
        var d = Math.max(280, 146 * c.length + 133);
        l.push(d);
        i += d;
    });
    var o = document.createElement("canvas");
    o.width = 5120;
    o.height = i;
    var n = o.getContext("2d");
    n.fillStyle = "#050505";
    n.fillRect(0, 0, 5120, i);
    n.fillStyle = "#111111";
    n.strokeStyle = "rgba(255,215,0,0.2)";
    n.lineWidth = 16;
    if (n.roundRect) {
        n.beginPath();
        n.roundRect(160, 160, 4800, i - 320, 96);
        n.fill();
        n.stroke();
    } else {
        n.fillRect(160, 160, 4800, i - 320);
        n.strokeRect(160, 160, 4800, i - 320);
    }
    n.textAlign = "center";
    n.textBaseline = "middle";
    n.fillStyle = "#FFD700";
    n.font = "560px sans-serif";
    n.fillText(e.title, 2560, 980);
    n.textAlign = "left";
    var s = 1760;
    t.forEach(function(t, e) {
        n.fillStyle = "rgba(255,215,0,0.2)";
        n.fillRect(320, s - 160, 4480, 8);
        n.fillStyle = "#FFA500";
        n.font = "bold 96px sans-serif";
        n.fillText(t, 320, s);
        n.fillStyle = "#ffffff";
        n.font = "bold 96px sans-serif";
        n.textAlign = "right";
        var a = s;
        r[t].forEach(function(e) {
            n.fillText(e.trim(), 4800, a);
            a += 146;
        });
        n.textAlign = "left";
        s += l[e];
    });
    var c = document.createElement("a");
    c.href = o.toDataURL("image/png");
    c.download = "glyphlab_" + e.baseHex + ".png";
    c.click();
}