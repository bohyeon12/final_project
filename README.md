# final_project

1 �꿡�� ������Ʈ ��������
git clone https://github.com/bohyeon12/final_project.git

2 Node.js�� ���ٸ� ��ġ 
https://nodejs.org/ko/download

3 notion-clone �������� �����ڱ������� cmd ����

4 Clerk API ����� ���� �غ�
https://clerk.com/ ���� ȸ������
cmd�� npm install @clerk/nextjs �Է�
.env.local ���� �����
Clerk dashboard -> configure -> API key ���� APIŰ �������� .env.local�� �ٿ��ֱ�
configure -> sessions -> Customize session token ���� edit Ŭ���ϰ� 
{
	"email": "{{user.primary_email_address}}",
	"image": "{{user.image_url}}",
	"fullName": "{{user.full_name}}"
}
�ٿ��ֱ�

5 shadcn ����� ���� �غ�
npx shadcn@latest init -> Default -> css variables yes

6 Firebase API ����� ���� �غ� 
cmd�� npm install firebase ,
npm install firebase-admin �Է�
https://firebase.google.com/?hl=ko ���� ȸ������
������Ʈ ���� 
�־����� SDK �ڵ��� const firebaseConfig = { ... } �� ...�� �ش��ϴ� �κи� �����ؼ� �ٿ��ֱ�
Firebase Ȩ���������� ���� ������Ʈ�� �� setting -> service accounts -> Generate new service key Ŭ��
�ٿ�ε� ���� key ������ ������Ʈ�ȿ� �������� �����̸��� service_key.json ���� ����

7 liveblock ����� ���� �غ�
cmd�� npm install @liveblocks/client @liveblocks/react @liveblocks/react-ui @liveblocks/react-blocknote @blocknote/core @blocknote/react @blocknote/mantine �Է�
npx create-liveblocks-app@latest --init --framework react �� �Է�
https://liveblocks.io/ �� ���� -> Dashboard -> create project -> API key ����
.env.local���� 
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_PRIVATE_KEY=
�� �������� public key�� private key�� �ش��ϴ� Ű������ �ʱ�ȭ