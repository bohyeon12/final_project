# final_project

1 깃에서 프로젝트 가져오기
git clone https://github.com/bohyeon12/final_project.git

2 Node.js가 없다면 설치 
https://nodejs.org/ko/download

3 notion-clone 폴더에서 관리자권한으로 cmd 실행

4 Clerk API 사용을 위한 준비
https://clerk.com/ 에서 회원가입
cmd에 npm install @clerk/nextjs 입력
.env.local 파일 만들기
Clerk dashboard -> configure -> API key 에서 API키 가져오고 .env.local에 붙여넣기
configure -> sessions -> Customize session token 에서 edit 클릭하고 
{
	"email": "{{user.primary_email_address}}",
	"image": "{{user.image_url}}",
	"fullName": "{{user.full_name}}"
}
붙여넣기

5 shadcn 사용을 위한 준비
npx shadcn@latest init -> Default -> css variables yes

6 Firebase API 사용을 위한 준비 
cmd에 npm install firebase ,
npm install firebase-admin 입력
https://firebase.google.com/?hl=ko 에서 회원가입
프로젝트 생성 
주어지는 SDK 코드의 const firebaseConfig = { ... } 중 ...에 해당하는 부분만 복사해서 붙여넣기
Firebase 홈페이지에서 만든 프로젝트에 들어가 setting -> service accounts -> Generate new service key 클릭
다운로드 받은 key 파일을 프로젝트안에 가져오고 파일이름을 service_key.json 으로 수정

7 liveblock 사용을 위한 준비
cmd에 npm install @liveblocks/client @liveblocks/react @liveblocks/react-ui @liveblocks/react-blocknote @blocknote/core @blocknote/react @blocknote/mantine 입력
npx create-liveblocks-app@latest --init --framework react 도 입력
https://liveblocks.io/ 에 접속 -> Dashboard -> create project -> API key 복사
.env.local에서 
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_PRIVATE_KEY=
위 변수들을 public key와 private key에 해당하는 키값으로 초기화
