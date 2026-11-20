export function drawWatermark(canvas,img,opt){const w=img.width,h=img.height;canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(opt.format==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h)}ctx.drawImage(img,0,0);ctx.save();ctx.globalAlpha=opt.opacity;const f=Math.max(opt.minFont || 12,Math.min(w*opt.size,h*.20));ctx.font='600 '+f+'px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.translate(w/2,h/2);ctx.rotate(opt.angle*Math.PI/180);
        const tw = ctx.measureText(opt.text).width;
        const paint = (x, y) => {
            ctx.lineWidth = Math.max(1, f * .078);
            ctx.strokeStyle = opt.pale ? 'rgba(255,255,255,.65)' : 'rgba(0,0,0,.76)';
            ctx.strokeText(opt.text, x, y);
            ctx.fillStyle = opt.pale ? '#374043' : '#fff';
            ctx.fillText(opt.text, x, y);
        };
        if (opt.narrow) {
            const angle = opt.angle * Math.PI / 180;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const horizontalHalf = (tw * cos + f * Math.abs(sin)) / 2;
            const verticalHalf = (tw * Math.abs(sin) + f * cos) / 2;
            const side = Math.min(w * .32, w * .47 - horizontalHalf);
            const rise = Math.max(0, Math.min(h * .18, h * .45 - verticalHalf));
            const centers = [[0, 0]];
            if (side > 0 && (side > horizontalHalf * 2 || rise * cos - side * sin > f * 1.6)) {
                centers.push([-side, -rise], [side, rise]);
            }
            for (const [x, y] of centers) {
                paint(x * cos + y * sin, y * cos - x * sin);
            }
        } else {
            const diagonal = Math.hypot(w, h);
            const dx = Math.max(tw * 1.45, f * 6) * opt.spacing;
            const dy = f * 3.25 * opt.spacing;
            const columns = Math.ceil(diagonal / dx);
            const rows = Math.ceil(diagonal / dy);
            for (let row = -rows; row <= rows; row++) {
                for (let col = -columns; col <= columns; col++) {
                    paint((col + Math.abs(row % 2) * .5) * dx, row * dy);
                }
            }
        }
    ctx.restore();return canvas}

// Same text renderer and centered stamp layout used for the portfolio images.
export function paintWatermark(canvas, width, height) {
  const scale = window.devicePixelRatio || 1;
  const source = document.createElement('canvas');
  source.width = Math.max(1, Math.round(width * scale));
  source.height = Math.max(1, Math.round(height * scale));
  drawWatermark(canvas, source, {text:'LEPTAILURE · leptailure.github.io',
    opacity:.30, size:.022, spacing:1.55, angle:-14, pale:false, narrow:true,
    minFont:12 * scale, format:'image/png'});
}
