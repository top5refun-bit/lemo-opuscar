#!/usr/bin/env python3
"""Natural Earth 1:50m coastline (public domain) → page/assets/coast.json, clipped to northern Italy / the Adriatic (no borders drawn)."""
import json, os, sys
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g = json.load(open(os.path.join(D, 'source/natural-earth/ne_50m_coastline.geojson'))); L0, L1, A0, A1 = 5.0, 17.5, 41.5, 48.5; out = []
for f in g['features']:
    geom = f['geometry']; parts = geom['coordinates'] if geom['type'] == 'MultiLineString' else [geom['coordinates']]
    for p in parts:
        cur = []
        for lon, lat in p:
            if L0 <= lon <= L1 and A0 <= lat <= A1: cur.append([round(lon, 3), round(lat, 3)])
            else:
                if len(cur) > 1: out.append(cur)
                cur = []
        if len(cur) > 1: out.append(cur)
json.dump(out, open(os.path.join(D, 'page/assets/coast.json'), 'w'), separators=(',', ':'))
