import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Box,
  Button,
  Modal,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Pagination,
} from "@mui/material";

const RecipeManager = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]); // 검색 결과 저장
  const [searchQuery, setSearchQuery] = useState(""); // 검색 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const itemsPerPage = 5; // 한 페이지 표시 항목 수

  const recipeCollectionRef = collection(db, "recipe");

  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedSubCollection, setSelectedSubCollection] = useState("");
  const [subCollectionData, setSubCollectionData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubEditMode, setIsSubEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

   // 초기 form 데이터 정의
   const initialFormData = {
    id: "",
    name: "",
    description: "",
    cooking_time: "",
    finishing: "",
    level: "",
    tip_knowhow: "",
    video_id: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const initialSubFormData = {
    id: "",
    name: "",
    volume: "",
    title: "",
    description: "",
    step: "",
    time: "",
  };
  const [subFormData, setSubFormData] = useState(initialSubFormData);

 // Firebase 컬렉션 가져오기
  const fetchRecipes = useCallback(async () => {
    const data = await getDocs(collection(db, "recipe"));
    setRecipes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  }, []);

        // 데이터 로드 및 초기화
        useEffect(() => {
          fetchRecipes();
        }, [fetchRecipes]); // searchQuery 제거

        // // 검색어 변경 시 검색 로직 실행
        useEffect(() => {
          applySearch();
        }, [searchQuery]); // 검색어 변경 시에만 실행

        // 검색 버튼 또는 Enter 키 동작
        const handleSearch = () => {
          applySearch();
        };

        // Enter 키 이벤트 핸들러
        const handleKeyPress = (event) => {
          if (event.key === "Enter") {
            handleSearch();
          }
        };

      // 검색 적용
      const applySearch = useCallback(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
          setFilteredRecipes(recipes); // 검색어가 없을 때 전체 데이터를 보여줌
        } else {
          const filtered = recipes.filter((recipe) => {
            const name = recipe.name?.toLowerCase() || ""; // null-safe
            return name.includes(query);
          });
          setFilteredRecipes(filtered); // 검색 결과 갱신
        }
      }, [searchQuery, recipes]);


    const currentRecipes = filteredRecipes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    // 현재 페이지 데이터 계산
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

   // 페이지 변경
   const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Fetch sub-collection data
  const fetchSubCollection = async (recipeId, subCollectionName) => {
    const subCollectionRef = collection(db, `recipe/${recipeId}/${subCollectionName}`);
    const data = await getDocs(subCollectionRef);
    setSubCollectionData(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    setSelectedRecipeId(recipeId);
    setSelectedSubCollection(subCollectionName);
  };

  // Save recipe
  // 레시피 저장
  const handleSave = async () => {
    const recipeDocRef = isEditMode
      ? doc(db, "recipe", formData.id)
      : collection(db, "recipe");
    const saveAction = isEditMode ? updateDoc(recipeDocRef, formData) : addDoc(recipeDocRef, formData);

    await saveAction;
    setIsEditMode(false);
    setOpen(false);
    setFormData(initialFormData);
    fetchRecipes();
  };

  // 하위 데이터 저장
  const handleSubSave = async () => {
    const subCollectionRef = collection(
      db,
      `recipe/${selectedRecipeId}/${selectedSubCollection}`
    );
    const subDocRef = isSubEditMode
      ? doc(db, `recipe/${selectedRecipeId}/${selectedSubCollection}`, subFormData.id)
      : subCollectionRef;

    const saveAction = isSubEditMode
      ? updateDoc(subDocRef, subFormData)
      : addDoc(subCollectionRef, subFormData);

    await saveAction;
    setIsSubEditMode(false);
    setSubOpen(false);
    setSubFormData(initialSubFormData);
    fetchSubCollection(selectedRecipeId, selectedSubCollection);
  };

  const resetSubFormData = () => {
    setSubFormData({
      id: "",
      name: "",
      volume: "",
      title: "",
      description: "",
      step: "",
      time: "",
    });
  };

  // Render fields for sub-collection modal
  const renderSubFields = () => {
    if (selectedSubCollection === "equipment") {
      return (
        <>
          <TextField
            label="이름"
            fullWidth
            value={subFormData.name}
            onChange={(e) =>
              setSubFormData({ ...subFormData, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
        </>
      );
    } else if (selectedSubCollection === "ingredients") {
      return (
        <>
          <TextField
            label="이름"
            fullWidth
            value={subFormData.name}
            onChange={(e) =>
              setSubFormData({ ...subFormData, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="양/설명"
            fullWidth
            multiline
            value={subFormData.volume}
            onChange={(e) =>
              setSubFormData({ ...subFormData, volume: e.target.value })
            }
            sx={{ mb: 2 }}
          />
        </>
      );
    } else if (selectedSubCollection === "cooking_methods") {
      return (
        <>
          <TextField
            label="제목"
            fullWidth
            value={subFormData.title}
            onChange={(e) =>
              setSubFormData({ ...subFormData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="설명"
            fullWidth
            multiline
            value={subFormData.description}
            onChange={(e) =>
              setSubFormData({ ...subFormData, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="스텝"
            fullWidth
            type="number"
            value={subFormData.step}
            onChange={(e) =>
              setSubFormData({ ...subFormData, step: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="시간"
            fullWidth
            value={subFormData.time}
            onChange={(e) =>
              setSubFormData({ ...subFormData, time: e.target.value })
            }
            sx={{ mb: 2 }}
          />
        </>
      );
    }
    return null;
  };
  
  // Delete recipe
  const handleDelete = async (id) => {
    const recipeDoc = doc(db, "recipe", id);
    await deleteDoc(recipeDoc);
    fetchRecipes();
  };

  // Delete sub-collection data
  const handleSubDelete = async (id) => {
    const subDoc = doc(db, `recipe/${selectedRecipeId}/${selectedSubCollection}`, id);
    await deleteDoc(subDoc);
    fetchSubCollection(selectedRecipeId, selectedSubCollection);
  };

  // Enable edit mode for recipe
  const handleEdit = (recipe) => {
    setFormData(recipe);
    setIsEditMode(true);
    setOpen(true);
  };

  // Enable edit mode for sub-collection
  const handleSubEdit = (data) => {
    setSubFormData(data);
    setIsSubEditMode(true);
    setSubOpen(true);
  };

  // Modal 닫기
  const handleClose = () => {
    setOpen(false);
    setIsEditMode(false);
    setFormData(initialFormData);
  };

  const handleSubClose = () => {
    setSubOpen(false);
    setIsSubEditMode(false);
    setSubFormData(initialSubFormData);
  };

    // Pagination에서 잘못된 페이지를 방지
    useEffect(() => {
      if (currentPage > Math.ceil(filteredRecipes.length / itemsPerPage)) {
        setCurrentPage(1); // 유효하지 않은 페이지를 첫 번째 페이지로 이동
      }
    }, [filteredRecipes, currentPage, itemsPerPage]);
    
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recipe 관리
      </Typography>
      {/* 검색 입력 필드 */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <TextField
          label="레시피 검색"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // 검색어 입력
          onKeyPress={handleKeyPress} // Enter 키 동작
        />
        <Button
          variant="contained"
          color="primary"
          onClick={applySearch}
          sx={{ ml: 2 }}
        >
          검색
        </Button>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        새 레시피 추가
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell>설명</TableCell>
              <TableCell>조리 시간</TableCell>
              <TableCell>Tip/Knowhow</TableCell>
              <TableCell>마무리</TableCell>
              <TableCell>레벨</TableCell>
              <TableCell>Video ID</TableCell>
              <TableCell>액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {currentRecipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>{recipe.name}</TableCell>
                <TableCell>{recipe.description}</TableCell>
                <TableCell>{recipe.cooking_time}</TableCell>
                <TableCell>{recipe.tip_knowhow}</TableCell>
                <TableCell>{recipe.finishing}</TableCell>
                <TableCell>{recipe.level}</TableCell>
                <TableCell>{recipe.video_id}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setIsEditMode(true);
                      setFormData(recipe);
                      setOpen(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    수정
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(recipe.id)}
                    sx={{ mr: 1 }}
                  >
                    삭제
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() =>
                      fetchSubCollection(recipe.id, "ingredients")
                    }
                    sx={{ mr: 1 }}
                  >
                    재료 보기
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() =>
                      fetchSubCollection(recipe.id, "equipment")
                    }
                    sx={{ mr: 1 }}
                  >
                    도구 보기
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() =>
                      fetchSubCollection(recipe.id, "cooking_methods")
                    }
                  >
                    요리법 보기
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          // count={Math.ceil(recipes.length / itemsPerPage)}
          count={Math.ceil(filteredRecipes.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {selectedRecipeId && selectedSubCollection && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            {selectedSubCollection} 관리
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSubOpen(true)}
            sx={{ mb: 2 }}
          >
            새 데이터 추가
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>이름/제목</TableCell>
                  <TableCell>설명/양</TableCell>
                  <TableCell>스텝</TableCell>
                  <TableCell>시간</TableCell>
                  <TableCell>액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subCollectionData.map((data) => (
                  <TableRow key={data.id}>
                    <TableCell>{data.name || data.title}</TableCell>
                    <TableCell>{data.volume || data.description}</TableCell>
                    <TableCell>{data.step}</TableCell>
                    <TableCell>{data.time}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleSubEdit(data)}
                        sx={{ mr: 1 }}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleSubDelete(data.id)}
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* 레시피 추가/수정 모달 */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {isEditMode ? "레시피 수정" : "새 레시피 추가"}
          </Typography>
          <TextField
            label="이름"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="설명"
            fullWidth
            multiline
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="조리 시간"
            fullWidth
            value={formData.cooking_time}
            onChange={(e) =>
              setFormData({ ...formData, cooking_time: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="마무리"
            fullWidth
            multiline
            value={formData.finishing}
            onChange={(e) =>
              setFormData({ ...formData, finishing: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="레벨"
            fullWidth
            type="number"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Tip/Knowhow"
            fullWidth
            multiline
            value={formData.tip_knowhow}
            onChange={(e) =>
              setFormData({ ...formData, tip_knowhow: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Video ID"
            fullWidth
            value={formData.video_id}
            onChange={(e) =>
              setFormData({ ...formData, video_id: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={handleClose}>취소</Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              저장
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 하위 컬렉션 추가/수정 모달 */}
      <Modal open={subOpen} onClose={() => setSubOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {isSubEditMode ? "하위 데이터 수정" : "새 데이터 추가"}
          </Typography>
          {renderSubFields()}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={() => setSubOpen(false)}>취소</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubSave}
            >
              저장
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RecipeManager;