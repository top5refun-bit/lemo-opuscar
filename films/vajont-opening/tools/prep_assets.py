import sys,os,json
from PIL import Image
S=sys.argv[1]; O=sys.argv[2]
# usage: prep_assets.py <source/scenes> <page/assets>  (copies the 28 unique images under short names, longest side ≤ 2400 px)
M={'gorge55':'S01_Summer_1959_Vajont_location/real/Valle_del_Vajont_1955.jpg',
'village':'S01_Summer_1959_Vajont_location/real/Vista_della_gola_del_Vajont_prima_della_costruzione_della_diga.jpg',
'edo':'S02_Edoardo_maps_the_mountain/real/Edoardo_Semenza.jpg',
'ai01':'S02_Edoardo_maps_the_mountain/reconstruction/AI01_Geologist_1959.jpg',
'blondin57':'S03_Dam_almost_finished/real/1957._Diga_del_Vajont._Stazione_mobile_del_Blondin_per_la_stesura_del_calcestruzzo.jpg',
'dam60v':'S03_Dam_almost_finished/real/Diga_del_Vajont_vista_da_valle_(1960).jpg',
'pano60':'S03_Dam_almost_finished/real/Vajont_Dam_1960_panorama.jpg',
'carlo':'S04_Carlo_father_and_engineer/real/Carlo_Semenza.jpg',
'cabin':'S04_Carlo_father_and_engineer/real/Diga_con_cabina_comandi.jpg',
'crack60':'S05_Mountain_not_solid/real/Frana_Monte_Toc_1960_1.jpg',
'toc':'S05_Mountain_not_solid/real/Vajont_monte_toc_frana.jpg',
'map':'S06_Prehistoric_scar/real/Mappa_del_Vajont_1.jpg',
'ai02':'S06_Prehistoric_scar/reconstruction/AI02_Geology_Concept.jpg',
'lake60a':'S08_9_October_1963/real/Diga_del_Vajont_1960.jpg',
'lake60b':'S08_9_October_1963/real/Vajont_Diga_1960.jpg',
'slide63':'S09_260_million_cubic_metres/real/Vajont_Dam_landslide.jpg',
'ai03':'S09_260_million_cubic_metres/reconstruction/AI03_Landslide_Reconstruction.jpg',
'dam63':'S10_Slide_enters_reservoir/real/Vajont_Dam_1963.jpg',
'ai04':'S11_Wave_rushes_across_lake/reconstruction/AI04_Wave_Reconstruction.jpg',
'longB':'S12_Overtopping_and_Longarone/real/Longarone_before_Vajont_dam_disaster.jpg',
'longA':'S12_Overtopping_and_Longarone/real/Disastro_del_Vajont,_9_ottobre_1963_(3).jpg',
'pirago':'S13_Nearly_two_thousand_victims/real/Campanile_Pirago.jpg',
'dis1':'S13_Nearly_two_thousand_victims/real/DisastroVajont1.jpg',
'v1963_3':'S13_Nearly_two_thousand_victims/real/Vajont1963_3.jpg',
'cartolina':'S14_Dam_survived/real/Cartolina_Diga_del_Vajont.jpg',
'damModern':'S14_Dam_survived/real/Vajont_Dam.jpg',
'damAfter':'S14_Dam_survived/real/Vajont_Dam_after_October_9_1963.jpg',
'aerial63':'S16_The_fatal_paradox/real/Disastro_del_Vajont,_9_ottobre_1963_(1).jpg'}
info={}
for k,p in M.items():
    im=Image.open(os.path.join(S,p)).convert('RGB')
    if im.width>2400: im=im.resize((2400,round(im.height*2400/im.width)),Image.LANCZOS)
    im.save(os.path.join(O,k+'.jpg'),quality=92); info[k]={'w':im.width,'h':im.height,'src':p}
json.dump(info,open(os.path.join(O,'assets.json'),'w'),indent=1)
