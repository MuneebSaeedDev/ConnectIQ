import re,io
p=r'C:\Users\Ali\.claude\projects\c--Users-Ali-Desktop-Intern-Project\0458b113-3a59-4a67-b316-c03823fa7d13\tool-results\toolu_bdrk_01PnQWrw6JDdcNcJaDJxZhdi.json'
s=open(p,encoding='utf-8').read()
names=re.findall(r'<text id=\\"[^"]+\\" name=\\"([^"]*?)\\"', s)
out=io.open('.tmp/scr027-texts.txt','w',encoding='utf-8')
out.write('textcount %d\n'%len(names))
for n in names:
    out.write(n+'\n')
out.close()
print('done',len(names))
