import re,io
p=r'C:\Users\Ali\.claude\projects\c--Users-Ali-Desktop-Intern-Project\0458b113-3a59-4a67-b316-c03823fa7d13\tool-results\toolu_bdrk_01PnQWrw6JDdcNcJaDJxZhdi.json'
s=open(p,encoding='utf-8').read()
i=s.find('93:3115')
out=io.open('.tmp/dialog.txt','w',encoding='utf-8')
if i<0:
    out.write('NOT FOUND 93:3115\n')
    # search for 'Confirm' / 'Save' dialog text near end
    for m in re.finditer(r'(Confirm|Discard|Unsaved|dialog|Dialog)', s):
        pass
else:
    seg=s[i-200:i+4000]
    names=re.findall(r'name=\\"([^"]*?)\\"', seg)
    out.write('names near 93:3115:\n')
    for n in names: out.write(n+'\n')
out.close()
print('done', i)
