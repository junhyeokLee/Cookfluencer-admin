import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase"; // Firebase 설정 가져오기
import "./season.css"; // 스타일 파일 추가

const Season = () => {
  const [seasons, setSeasons] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    sub_title: "",
    image: "",
    position: "",
    update_date: "",
  });
  const [editingSeason, setEditingSeason] = useState(null); // 수정 중인 항목
  const [videos, setVideos] = useState([]); // 비디오 목록
  const [currentSeasonId, setCurrentSeasonId] = useState(null); // 현재 선택된 시즌 ID
  const [videoFormData, setVideoFormData] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
  }); // 비디오 입력 데이터
  const [allVideos, setAllVideos] = useState([]); // 전체 비디오 목록
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false); // 비디오 팝업 상태


  const seasonCollectionRef = collection(db, "season");

  // Firestore에서 시즌 데이터 가져오기
  const fetchSeasons = async () => {
    const data = await getDocs(seasonCollectionRef);
    setSeasons(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  // Firestore에서 비디오 데이터 가져오기
  const fetchVideos = async (seasonId) => {
    if (!seasonId) return;
    const videoCollectionRef = collection(db, `season/${seasonId}/videos`);
    const data = await getDocs(videoCollectionRef);
    setVideos(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  // 모든 비디오 검색
    const fetchAllVideos = async () => {
        const videoCollectionRef = collection(db, "videos"); // 비디오 컬렉션 경로
        const data = await getDocs(videoCollectionRef);
        return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    };
    

  useEffect(() => {
    fetchSeasons();
  }, []);

  // 시즌 추가
  const addSeason = async () => {
    if (!formData.title || !formData.sub_title) {
      alert("Title과 Sub Title을 입력하세요.");
      return;
    }
    await addDoc(seasonCollectionRef, formData);
    setFormData({
      title: "",
      sub_title: "",
      image: "",
      position: "",
      update_date: "",
    });
    fetchSeasons(); // 추가 후 새로고침
  };

  // 시즌 수정
  const saveUpdatedSeason = async () => {
    if (editingSeason) {
      const seasonDoc = doc(db, "season", editingSeason.id);
      await updateDoc(seasonDoc, {
        title: editingSeason.title,
        sub_title: editingSeason.sub_title,
        image: editingSeason.image,
        position: editingSeason.position,
        update_date: editingSeason.update_date,
      });
      setEditingSeason(null); // 수정 종료
      fetchSeasons(); // 새로고침
    }
  };

  // 시즌 삭제
  const deleteSeason = async (id) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      const seasonDoc = doc(db, "season", id);
      await deleteDoc(seasonDoc);
      fetchSeasons(); // 삭제 후 새로고침
    }
  };

  // 비디오 추가
  const addVideo = async () => {
    if (!currentSeasonId) {
      alert("시즌을 선택하세요.");
      return;
    }
    const videoCollectionRef = collection(db, `season/${currentSeasonId}/videos`);
    await addDoc(videoCollectionRef, videoFormData);
    setVideoFormData({
      title: "",
      description: "",
      thumbnail_url: "",
    });
    fetchVideos(currentSeasonId); // 비디오 목록 새로고침
  };

  const openVideoPopup = async () => {
    const videos = await fetchAllVideos(); // 모든 비디오 가져오기
    setAllVideos(videos); // 상태에 저장
    setIsVideoPopupOpen(true); // 팝업 열기
  };
  
  const addSelectedVideoToSeason = async (video) => {
    if (!currentSeasonId) {
      alert("시즌을 선택하세요.");
      return;
    }
    const videoCollectionRef = collection(db, `season/${currentSeasonId}/videos`);
    await addDoc(videoCollectionRef, video); // 선택된 비디오 추가
    fetchVideos(currentSeasonId); // 비디오 목록 새로고침
    setIsVideoPopupOpen(false); // 팝업 닫기
  };
  
  // 비디오 삭제
  const deleteVideo = async (videoId) => {
    if (!currentSeasonId) return;
    const videoDocRef = doc(db, `season/${currentSeasonId}/videos`, videoId);
    await deleteDoc(videoDocRef);
    fetchVideos(currentSeasonId); // 비디오 목록 새로고침
  };

  return (
    <div className="season-container">
      <h1>Season 관리</h1>

      {/* 시즌 입력 폼 */}
      <div className="form-container">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Sub Title"
          value={formData.sub_title}
          onChange={(e) => setFormData({ ...formData, sub_title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        />
        <input
          type="number"
          placeholder="Position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
        <input
          type="text"
          placeholder="Update Date"
          value={formData.update_date}
          onChange={(e) => setFormData({ ...formData, update_date: e.target.value })}
        />
        <button onClick={addSeason} className="add-button">
          추가
        </button>
      </div>

      {/* 시즌 테이블 */}
      <table className="season-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Sub Title</th>
            <th>Image</th>
            <th>Position</th>
            <th>Update Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {seasons.map((season) => (
            <tr key={season.id}>
              {editingSeason?.id === season.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editingSeason.title}
                      onChange={(e) =>
                        setEditingSeason({ ...editingSeason, title: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editingSeason.sub_title}
                      onChange={(e) =>
                        setEditingSeason({ ...editingSeason, sub_title: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editingSeason.image}
                      onChange={(e) =>
                        setEditingSeason({ ...editingSeason, image: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editingSeason.position}
                      onChange={(e) =>
                        setEditingSeason({ ...editingSeason, position: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editingSeason.update_date}
                      onChange={(e) =>
                        setEditingSeason({ ...editingSeason, update_date: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button onClick={saveUpdatedSeason} className="save-button">
                      저장
                    </button>
                    <button onClick={() => setEditingSeason(null)} className="cancel-button">
                      취소
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{season.title}</td>
                  <td>{season.sub_title}</td>
                  <td>
                    <img src={season.image} alt="이미지" style={{ width: "100px" }} />
                  </td>
                  <td>{season.position}</td>
                  <td>{season.update_date}</td>
                  <td>
                    <button
                      onClick={() => setEditingSeason(season)}
                      className="edit-button"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteSeason(season.id)}
                      className="delete-button"
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => {
                        setCurrentSeasonId(season.id);
                        fetchVideos(season.id);
                         openVideoPopup();
                      }}
                      className="view-video-button"
                    >
                      비디오 보기
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 비디오 관리 */}
      {currentSeasonId && (
        <div className="video-management">
          <h2>비디오 관리</h2>
          <div className="video-form">
            <input
              type="text"
              placeholder="Video Title"
              value={videoFormData.title}
              onChange={(e) =>
                setVideoFormData({ ...videoFormData, title: e.target.value })
              }
            />
            <textarea
              placeholder="Video Description"
              value={videoFormData.description}
              onChange={(e) =>
                setVideoFormData({ ...videoFormData, description: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Thumbnail URL"
              value={videoFormData.thumbnail_url}
              onChange={(e) =>
                setVideoFormData({ ...videoFormData, thumbnail_url: e.target.value })
              }
            />
            <button onClick={addVideo} className="add-video-button">
              비디오 추가
            </button>
          </div>

          {/* 비디오 목록 */}
          <table className="video-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Thumbnail</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id}>
                  <td>{video.title}</td>
                  <td>{video.description}</td>
                  <td>
                    <img
                      src={video.thumbnail_url}
                      alt="Thumbnail"
                      style={{ width: "100px" }}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="delete-video-button"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Season;
