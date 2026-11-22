from pathlib import Path
from PIL import Image, ImageDraw
import cv2, numpy as np

NAMES=['pompes-diamant','dips-sur-chaise','kickback-triceps','extension-nuque-deux-mains','extension-triceps-unilaterale','extension-triceps-travers-corps','extension-triceps-allonge-sol','tate-press-sol','developpe-serre-sol','dips-entre-deux-supports']

def clean(src,dest):
    im=Image.open(src).convert('RGB').resize((560,190),Image.Resampling.LANCZOS)
    arr=np.asarray(im).copy()
    hi=arr.max(2).astype(np.int16); lo=arr.min(2).astype(np.int16)
    white=((lo>115)&((hi-lo)<50)).astype(np.uint8)
    n,components,stats,_=cv2.connectedComponentsWithStats(white,8)
    mask=np.zeros((190,560),dtype=np.uint8)
    for c in range(1,n):
        x,y,w,h,area=stats[c]
        touches_edge=(x<25 or x+w>535 or y<58 or y+h>132)
        long_line=(w>=75 and h<=13 and area>50)
        vertical=(h>=35 and w<=16 and (x<25 or x+w>535))
        if touches_edge and (long_line or vertical):mask[components==c]=255
    mask=cv2.dilate(mask,np.ones((3,3),np.uint8))
    cv2.ellipse(mask,(513,89),(36,37),0,0,360,255,-1)
    bgr=cv2.cvtColor(arr,cv2.COLOR_RGB2BGR)
    result=Image.fromarray(cv2.cvtColor(cv2.inpaint(bgr,mask,3,cv2.INPAINT_TELEA),cv2.COLOR_BGR2RGB))
    d=ImageDraw.Draw(result);d.rounded_rectangle((2,2,557,187),radius=17,outline=(255,137,21),width=3)
    result.save(dest,'WEBP',quality=93,method=6)
    print(dest.name, 'pixels nettoyes:',int((mask>0).sum()))

root=Path(__file__).resolve().parent
for name in NAMES:
    src=root/f'triceps-{name}.webp'
    if not src.exists():raise SystemExit('Source absente : '+str(src))
    clean(src,root/f'triceps-{name}-orange-v5.webp')
print('10 bandeaux originaux reconstruits.')
