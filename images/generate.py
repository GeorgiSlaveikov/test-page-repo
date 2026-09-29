"""Rebuild the original SVG catalog illustrations: python images/generate.py.
These are editable vector examples, not photographs of actual products.
"""
from pathlib import Path
from math import sin, cos, pi

ROOT = Path(__file__).resolve().parent
DEFS = '''<defs>
<linearGradient id="wall" x2=".8" y2="1"><stop stop-color="#e7e7dd"/><stop offset="1" stop-color="#d5d6c8"/></linearGradient>
<linearGradient id="sage"><stop stop-color="#7f8c68"/><stop offset=".4" stop-color="#b0ba94"/><stop offset=".7" stop-color="#929f77"/><stop offset="1" stop-color="#687757"/></linearGradient>
<linearGradient id="cream"><stop stop-color="#d3c5a9"/><stop offset=".4" stop-color="#fff4d8"/><stop offset=".7" stop-color="#e7d9b9"/><stop offset="1" stop-color="#c5b493"/></linearGradient>
<linearGradient id="pot"><stop stop-color="#c2b69e"/><stop offset=".35" stop-color="#eee6d1"/><stop offset="1" stop-color="#b1a68c"/></linearGradient>
<linearGradient id="gold" x2="1" y2="1"><stop stop-color="#eed49c"/><stop offset=".5" stop-color="#be9951"/><stop offset="1" stop-color="#f0d7a4"/></linearGradient>
<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="drop" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="8" dy="13" stdDeviation="7" flood-color="#403d31" flood-opacity=".2"/></filter>
<pattern id="layers" width="4" height="3" patternUnits="userSpaceOnUse"><path d="M0 1.5H4" stroke="#293626" stroke-opacity=".08" stroke-width=".6"/></pattern>
</defs>'''

def svg(name, content, bg='#eeede7', w=600, h=480):
    ROOT.joinpath(name + '.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{DEFS}<rect width="100%" height="100%" fill="{bg}"/>{content}</svg>', encoding='utf-8')

def lamp(x=0,y=0,s=1):
    ribs=''.join(f'<path d="M300 103 Q{184+i*14} 145 {151+i*15} 258" fill="none" stroke="{ "#d4ddba" if i%2 else "#556544"}" stroke-opacity=".25" stroke-width="3"/>' for i in range(21))
    return f'''<g transform="translate({x} {y}) scale({s})"><ellipse cx="313" cy="397" rx="132" ry="18" fill="#555a40" opacity=".17" filter="url(#shadow)"/>
<path d="M278 243 L263 382 Q300 405 338 382 L321 243Z" fill="url(#sage)"/>
<path d="M278 243 L263 382 Q300 405 338 382 L321 243Z" fill="url(#layers)"/>
<ellipse cx="300" cy="262" rx="154" ry="24" fill="#616d50"/>
<path d="M146 257 Q164 115 280 100 Q300 94 321 100 Q438 118 454 257 Q306 290 146 257Z" fill="url(#sage)"/>{ribs}
<ellipse cx="300" cy="260" rx="151" ry="13" fill="none" stroke="#64724f" stroke-width="3"/>
<path d="M335 382 Q390 393 402 384 T460 397" fill="none" stroke="#7a7867" stroke-width="3"/>
</g>'''

def flower(cx,cy,r,color):
    pts=[]
    for i in range(121):
        a=i/120*2*pi; rad=r*(.83+.17*cos(a*6)); pts.append(f'{cx+cos(a)*rad:.1f},{cy+sin(a)*rad:.1f}')
    path='M'+' L'.join(pts)+'Z'
    return f'<path d="{path}" fill="none" stroke="#9a7660" stroke-width="18" transform="translate(0 7)"/><path d="{path}" fill="none" stroke="{color}" stroke-width="16"/><path d="{path}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>'

def cutters():
    return f'''<ellipse cx="302" cy="342" rx="195" ry="28" fill="#9d8574" opacity=".13" filter="url(#shadow)"/><g filter="url(#drop)" transform="rotate(-15 300 240)">{flower(212,225,88,'#cc9b81')}
<path d="M335 198V140A55 55 0 0 1 110 0V198Z" fill="none" stroke="#adb596" stroke-width="15"/>
<path d="M336 322 C237 262 286 211 335 256 C382 210 434 262 336 322Z" fill="none" stroke="#bcab91" stroke-width="17"/>
</g>'''.replace('M335 198V140A55 55 0 0 1 110 0V198Z','M335 198V140a55 55 0 0 1 110 0V198Z')

def medals(sage=False):
    color='#74836a' if sage else '#42483e'
    art='<rect x="191" y="130" width="218" height="68" rx="34" fill="none" stroke="#d6dcc8" stroke-width="4"/><rect x="204" y="140" width="192" height="48" rx="24" fill="none" stroke="#d6dcc8" stroke-width="2"/>' if sage else '<path d="m197 195 60-82 46 53 30-34 65 63" fill="none" stroke="#c1c5b2" stroke-width="5"/><path d="m240 136 17 18 13-14" fill="none" stroke="#c1c5b2" stroke-width="4"/>'
    items=''
    for i,x in enumerate([212,302,390] if not sage else [245,355]):
        y=345+(i%2)*27
        items+=f'<path d="M{x-20} 235 L{x-13} {y-15} L{x+10} {y-15} L{x+20} 235" fill="none" stroke="{["#9b775f","#82918b","#b9aa8f"][i]}" stroke-width="13"/><circle cx="{x}" cy="{y}" r="29" fill="url(#gold)" stroke="#b89755" stroke-width="2"/><circle cx="{x}" cy="{y}" r="23" fill="none" stroke="#f5dfb1"/><path d="m{x} {y-13} 4 9 10 1-8 7 3 10-9-5-9 5 3-10-8-7 10-1Z" fill="#f8e6ba"/>'
    return f'<g filter="url(#drop)"><rect x="137" y="92" width="326" height="151" rx="9" fill="{color}"/>{art}<circle cx="152" cy="109" r="4" fill="#b7b9a9"/><circle cx="448" cy="109" r="4" fill="#b7b9a9"/>{items}</g>'

svg('lamp', '<path d="M0 360H600V480H0Z" fill="#dfdfd3"/>'+lamp(), '#e9eae1')
svg('cutters', cutters(), '#f0e7df')
svg('medals', medals(), '#e9e7e0')
svg('runner', medals(True), '#e4e9df')
ripple='M239 94 C203 122 260 144 223 174 C188 205 248 221 214 254 C187 286 242 300 222 330 C207 352 223 379 251 382 H349 C377 379 393 352 378 330 C358 300 413 286 386 254 C352 221 412 205 377 174 C340 144 397 122 361 94Z'
lines=''.join(f'<path d="M{245+i*10} 95 Q{220+i*13} 222 {245+i*10} 380" fill="none" stroke="#a39473" stroke-opacity=".2" stroke-width="2"/>' for i in range(12))
svg('ripple',f'<ellipse cx="305" cy="389" rx="129" ry="20" fill="#9b8662" opacity=".18" filter="url(#shadow)"/><path d="{ripple}" fill="url(#cream)"/><clipPath id="ripple-clip"><path d="{ripple}"/></clipPath><g clip-path="url(#ripple-clip)">{lines}</g><ellipse cx="300" cy="95" rx="61" ry="12" fill="#d9cba9"/><ellipse cx="300" cy="95" rx="49" ry="7" fill="#f8edce"/>','#ede9df')
svg('custom-cutter','''<g transform="rotate(-10 300 240)" filter="url(#drop)"><path d="M145 335V190a100 100 0 0 1 200 0v145Z" fill="none" stroke="#c6977a" stroke-width="17"/><path d="M145 330V185a100 100 0 0 1 200 0v145Z" fill="none" stroke="#e3b799" stroke-width="12"/><text x="245" y="236" font-family="Georgia,serif" font-size="40" font-style="italic" fill="#ba8d73" text-anchor="middle">happy</text><text x="245" y="278" font-family="Georgia,serif" font-size="40" font-style="italic" fill="#ba8d73" text-anchor="middle">days</text><path d="m424 229 20 40 45 7-33 32 8 45-40-21-40 21 8-45-33-32 45-7Z" fill="none" stroke="#a7ad8e" stroke-width="14"/></g>''','#eee3d9')
vase='M440 343 Q455 307 474 278 L474 231 Q509 217 544 231 L544 278 Q575 325 580 365 L571 453 Q510 472 448 453Z'
vribs=''.join(f'<path d="M{477+i*7} 232 Q{456+i*12} 340 {451+i*12} 455" stroke="#a99b80" stroke-opacity=".32" stroke-width="3" fill="none"/>' for i in range(10))
svg('studio',f'''<rect width="720" height="650" fill="url(#wall)"/><path d="M448 0H574L210 472H80Z" fill="#fffdf1" opacity=".32"/><path d="M608 0H660L298 472H246Z" fill="#fffdf1" opacity=".2"/><path d="M0 473H720V650H0Z" fill="#d0cdbc"/><path d="M0 474H720" stroke="#c0c1b0"/><ellipse cx="418" cy="500" rx="230" ry="28" fill="#55563f" opacity=".18" filter="url(#shadow)"/>
<path d="M74 462 L271 420 L474 470 L272 521Z" fill="#e8e3d3"/><path d="M74 462V515L272 578V521Z" fill="#d5ceba"/><path d="M272 521 474 470V526L272 578Z" fill="#c1bba7"/>
{lamp(-5,81,.98)}<ellipse cx="516" cy="461" rx="78" ry="14" fill="#5d5a46" opacity=".16" filter="url(#shadow)"/>
<path d="{vase}" fill="url(#pot)"/><clipPath id="vase-clip"><path d="{vase}"/></clipPath><g clip-path="url(#vase-clip)">{vribs}</g><ellipse cx="509" cy="232" rx="35" ry="9" fill="#a3967d"/><ellipse cx="509" cy="231" rx="27" ry="5" fill="#766f59"/>
<g transform="translate(192 300) scale(.64 .36) rotate(-15 420 390)" filter="url(#drop)">{flower(420,550,83,'#cf9b7b')}</g>''',w=720,h=650)
print('Created 7 original SVG illustrations.')
