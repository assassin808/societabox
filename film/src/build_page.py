import base64, json, sys, os
FS='../pdfbuild/node_modules/@fontsource/'
fonts=[('Fraunces',FS+'fraunces/files/fraunces-latin-700-normal.woff2','700','normal'),('Fraunces',FS+'fraunces/files/fraunces-latin-900-normal.woff2','900','normal'),
       ('Fraunces',FS+'fraunces/files/fraunces-latin-900-italic.woff2','900','italic'),('Caveat',FS+'caveat/files/caveat-latin-600-normal.woff2','600','normal'),
       ('Caveat',FS+'caveat/files/caveat-latin-700-normal.woff2','700','normal'),('Pixelify Sans',FS+'pixelify-sans/files/pixelify-sans-latin-700-normal.woff2','700','normal')]
ff=''.join(f"@font-face{{font-family:'{n}';src:url(data:font/woff2;base64,{base64.b64encode(open(p,'rb').read()).decode()}) format('woff2');font-weight:{w};font-style:{s};font-display:block}}\n" for n,p,w,s in fonts)
tl=json.load(open('timeline.json'))
js=open('film.js').read()
mode=sys.argv[1]
audio=''
if mode=='player':
    audio=base64.b64encode(open('master.m4a','rb').read()).decode()
fontload="Promise.all([['700 40px Fraunces'],['900 40px Fraunces'],['italic 900 40px Fraunces'],['600 40px Caveat'],['700 40px Caveat'],['700 40px \"Pixelify Sans\"']].map(f=>document.fonts.load(f[0])))"
if mode=='capture':
    html=f"""<!doctype html><html><head><meta charset="utf-8"><style>{ff}html,body{{margin:0;background:#000}}canvas{{display:block}}</style></head><body>
<canvas id="c" width="1920" height="1080"></canvas>
<script>window.YAX_TIMELINE={json.dumps(tl)};</script><script>{js}</script>
<script>window.READY={fontload}.then(()=>{{YAXFilm.buildTextures();window.ctx=document.getElementById('c').getContext('2d');return true;}});
window.frameAt=t=>{{YAXFilm.render(ctx,t);return document.getElementById('c').toDataURL('image/jpeg',0.93);}};</script></body></html>"""
    open('capture.html','w').write(html)
else:
    tpl=open('player_tpl.html').read()
    html=tpl.replace('/*FONTS*/',ff).replace('/*TIMELINE*/',json.dumps(tl)).replace('/*FILMJS*/',js).replace('/*AUDIO*/',audio).replace('/*FONTLOAD*/',fontload)
    open('reel.html','w').write(html)
print(mode,'ok')
