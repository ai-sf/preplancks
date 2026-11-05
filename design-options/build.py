import sys,re
base=open('_base.css').read()
for n in ['a-poster','b-sheet','c-registro','a1','a2']:
    s=open(f'src/{n}.html').read().replace('/*BASE*/',base)
    open(f'{n}.html','w').write(s)
    print(n,len(s))
