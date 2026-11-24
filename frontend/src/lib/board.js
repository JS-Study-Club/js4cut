import { fetchBoardPhotos, uploadPhoto } from "./api";

// 메인보드에 전시된 네컷을 최신순으로 가져온다. → [{ id, imageUrl, createdAt }]
export async function fetchPosts(limit = 50) {
  const { photos } = await fetchBoardPhotos(limit);
  return photos.map(({ id, imageUrl, createdAt }) => ({ id, imageUrl, createdAt }));
}

// 합성된 네컷을 메인보드에 저장한다. 전시에 동의한 경우에만 호출할 것.
// frameId: 서버 프레임의 uuid. 반환값의 id 를 이메일 전송의 photoId 로 넘기면 된다.
export function savePost({ image, frameId }) {
  return uploadPhoto({ image, frameId });
}
