import sys,json,soundfile as sf,sherpa_onnx as so
d=sys.argv[1]
r=so.OfflineRecognizer.from_transducer(encoder=d+'/encoder.int8.onnx',decoder=d+'/decoder.int8.onnx',joiner=d+'/joiner.int8.onnx',tokens=d+'/tokens.txt',model_type='nemo_transducer',num_threads=4)
a,sr=sf.read(sys.argv[2],dtype='float32')
# chunk at ~20s windows split on silence handled by caller: here whole file in 3 chunks with overlap-free cut points
cuts=[float(x) for x in sys.argv[4].split(',')] if len(sys.argv)>4 else []
bounds=[0.0]+cuts+[len(a)/sr]
words=[];text=[]
for i in range(len(bounds)-1):
    s=r.create_stream(); seg=a[int(bounds[i]*sr):int(bounds[i+1]*sr)]
    s.accept_waveform(sr,seg); r.decode_stream(s); res=s.result
    text.append(res.text)
    toks=res.tokens; ts=res.timestamps
    cur=None
    for tk,t in zip(toks,ts):
        t=t+bounds[i]
        if tk.startswith('▁') or tk.startswith(' ') or cur is None:
            if cur: words.append(cur)
            cur={'w':tk.lstrip('▁ '),'t0':round(t,3)}
        else: cur['w']+=tk
        cur['tl']=round(t,3)
    if cur: words.append(cur)
json.dump({'text':' '.join(text),'words':words},open(sys.argv[3],'w'),indent=0)
print(' '.join(text))
