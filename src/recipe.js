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
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";


const RecipeManager = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]); // 검색 결과 저장
  const [searchQuery, setSearchQuery] = useState(""); // 검색 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const itemsPerPage = 5; // 한 페이지 표시 항목 수

  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedSubCollection, setSelectedSubCollection] = useState("");
  const [subCollectionData, setSubCollectionData] = useState([]);
  const [newFields, setNewFields] = useState([]);

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

  // const initialSubFormData = {
  //   id: "",
  //   name: "",
  //   volume: "",
  //   title: "",
  //   description: "",
  //   step: "",
  //   time: "",
  // };
  // const [subFormData, setSubFormData] = useState(initialSubFormData);

  // 1️⃣ 서브컬렉션 타입별 초기값 설정
const getInitialSubFormData = (subCollection) => {
  switch (subCollection) {
    case "cooking_methods":
      return {
        title: "",
        description: "",
        step: 0,
        time: "",
      };
    case "equipment":
      return {
        name: "",
      };
    case "ingredients":
      return {
        name: "",
        volume: "",
      };
    default:
      return {};
  }
};

// 상태 초기화
const [subFormData, setSubFormData] = useState(getInitialSubFormData(""));

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
// ✅ 레시피 저장 (수정/추가)
const handleSave = async () => {
  const saveData = {
    ...formData,
    level: parseInt(formData.level, 10) || 0,  // 숫자형 변환
  };

  try {
    if (isEditMode) {
      // 🔄 기존 레시피 수정
      const recipeDocRef = doc(db, "recipe", formData.id);
      await updateDoc(recipeDocRef, saveData);

      // 🔥 UI 동기화: recipes 상태 직접 업데이트
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === formData.id ? { ...recipe, ...saveData } : recipe
        )
      );

      setFilteredRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === formData.id ? { ...recipe, ...saveData } : recipe
        )
      );

    } else {
      // ➕ 새 레시피 추가
      const docRef = await addDoc(collection(db, "recipe"), saveData);
      setRecipes((prevRecipes) => [
        { ...saveData, id: docRef.id },
        ...prevRecipes,
      ]);
      setFilteredRecipes((prevRecipes) => [
        { ...saveData, id: docRef.id },
        ...prevRecipes,
      ]);
    }

    setIsEditMode(false);
    setOpen(false);
    setFormData(initialFormData);

  } catch (error) {
    console.error("레시피 저장 실패:", error);
  }
};

// ✅ 레시피 삭제
const handleDelete = async (id) => {
  if (window.confirm("정말 삭제하시겠습니까?")) {
    try {
      const recipeDocRef = doc(db, "recipe", id);
      await deleteDoc(recipeDocRef);

      // 🔥 UI 동기화: 삭제된 레시피 즉시 반영
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== id));
      setFilteredRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe.id !== id)
      );

    } catch (error) {
      console.error("레시피 삭제 실패:", error);
    }
  }
};


  // 필드 추가
// 1️⃣ 서브컬렉션별 필드 추가
const handleAddField = () => {
  if (!selectedSubCollection) {
    alert("서브컬렉션을 선택해주세요.");
    //r
    return;
  }

  let newField = {};

  switch (selectedSubCollection) {
    case "cooking_methods":
      newField = { title: "", description: "", step: 0, time: "" };
      break;
    case "equipment":
      newField = { name: "" };
      break;
    case "ingredients":
      newField = { name: "", volume: "" };
      break;
    default:
      newField = {};
  }

  setNewFields((prev) => [...prev, newField]);
};



  const handleFieldChange = (index, field, value, isNewField = true) => {
    if (field === "step") {
      value = parseInt(value, 10) || 0;
    }

    const target = isNewField ? newFields : subCollectionData;
    const updatedFields = target.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    isNewField ? setNewFields(updatedFields) : setSubCollectionData(updatedFields);
  };

  // 저장
  // 3️⃣ 서브컬렉션별 저장 로직
  const handleSaveAll = async () => {
    if (!selectedRecipeId || !selectedSubCollection) {
      alert("레시피와 서브컬렉션을 선택해주세요.");
      return;
    }
  
    // 새로 추가된 필드 저장
    for (const field of newFields) {
      let preparedField = {};
  
      // 서브컬렉션 타입에 따라 저장할 데이터 구조를 정의
      switch (selectedSubCollection) {
        case "cooking_methods":
          preparedField = {
            title: field.title || "",
            description: field.description || "",
            step: parseInt(field.step, 10) || 0,
            time: field.time || "",
          };
          break;
  
        case "equipment":
          preparedField = {
            name: field.name || "",
          };
          break;
  
        case "ingredients":
          preparedField = {
            name: field.name || "",
            volume: field.volume || "",
          };
          break;
  
        default:
          console.error("유효하지 않은 서브컬렉션입니다.");
          return;
      }
  
      try {
        const subCollectionRef = collection(db, `recipe/${selectedRecipeId}/${selectedSubCollection}`);
        await addDoc(subCollectionRef, preparedField);
      } catch (error) {
        console.error("서브컬렉션 저장 실패:", error);
      }
    }
  
    // 기존 필드 업데이트
    for (const field of subCollectionData) {
      try {
        const docRef = doc(db, `recipe/${selectedRecipeId}/${selectedSubCollection}`, field.id);
        await updateDoc(docRef, field);
      } catch (error) {
        console.error("서브컬렉션 업데이트 실패:", error);
      }
    }
  
    // 저장 후 상태 초기화 및 데이터 갱신
    setNewFields([]);
    fetchSubCollection(selectedRecipeId, selectedSubCollection);
    alert("저장이 완료되었습니다.");
  };
  


  // 삭제
  const handleDeleteField = async (id, isNewField) => {
    if (isNewField) {
      setNewFields((prev) => prev.filter((_, index) => index !== id));
    } else {
      try {
        const docRef = doc(db, `recipe/${selectedRecipeId}/${selectedSubCollection}`, id);
        await deleteDoc(docRef);
        fetchSubCollection(selectedRecipeId, selectedSubCollection);
      } catch (error) {
        console.error("삭제 실패:", error);
      }
    }
  };
  

  // 하위 데이터 저장
  // const handleSubSave = async () => {
  //   const subCollectionRef = collection(
  //     db,
  //     `recipe/${selectedRecipeId}/${selectedSubCollection}`
  //   );
  //   const subDocRef = isSubEditMode
  //     ? doc(db, `recipe/${selectedRecipeId}/${selectedSubCollection}`, subFormData.id)
  //     : subCollectionRef;

  //   const saveAction = isSubEditMode
  //     ? updateDoc(subDocRef, subFormData)
  //     : addDoc(subCollectionRef, subFormData);

  //   await saveAction;
  //   setIsSubEditMode(false);
  //   setSubOpen(false);
  //   setSubFormData(initialSubFormData);
  //   fetchSubCollection(selectedRecipeId, selectedSubCollection);
  // };
  // 하위 컬렉션 저장
const handleSubSave = async () => {
  const subCollectionRef = collection(
    db,
    `recipe/${selectedRecipeId}/${selectedSubCollection}`
  );

  let saveData = {};

  switch (selectedSubCollection) {
    case "cooking_methods":
      saveData = {
        title: subFormData.title,
        description: subFormData.description,
        step: parseInt(subFormData.step, 10) || 0,
        time: subFormData.time,
      };
      break;

    case "equipment":
      saveData = {
        name: subFormData.name,
      };
      break;

    case "ingredients":
      saveData = {
        name: subFormData.name,
        volume: subFormData.volume,
      };
      break;

    default:
      return;
  }

  // 새 데이터 추가 또는 수정
  const docRef = isSubEditMode
  ? doc(db, `recipe/${selectedRecipeId}/${selectedSubCollection}`, subFormData.id)
  : subCollectionRef;

  const saveAction = isSubEditMode ? updateDoc(docRef, saveData) : addDoc(subCollectionRef, saveData);

  await saveAction;

  setIsSubEditMode(false);
  setSubOpen(false);
  setSubFormData(getInitialSubFormData(selectedSubCollection));
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

// 2️⃣ 서브컬렉션별 입력 필드 렌더링
const renderSubFields = () => {
  return newFields.map((field, index) => {
    switch (selectedSubCollection) {
      case "cooking_methods":
        return (
          <Box key={field.title} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TextField
              label="제목"
              value={field.title}
              onChange={(e) => handleFieldChange(index, "title", e.target.value)}
              sx={{ flex: 1, mr: 2 }}
            />
            <TextField
              label="설명"
              value={field.description}
              onChange={(e) => handleFieldChange(index, "description", e.target.value)}
              sx={{ flex: 2, mr: 2 }}
            />
            <TextField
              label="스텝"
              type="number"
              value={field.step}
              onChange={(e) => handleFieldChange(index, "step", parseInt(e.target.value, 10))}
              sx={{ flex: 1, mr: 2 }}
            />
            <TextField
              label="시간"
              value={field.time}
              onChange={(e) => handleFieldChange(index, "time", e.target.value)}
              sx={{ flex: 1, mr: 2 }}
            />
            <IconButton color="error" onClick={() => handleDeleteField(field.id, true)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        );

      case "equipment":
        return (
          <Box key={field.name} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TextField
              label="도구 이름"
              value={field.name}
              onChange={(e) => handleFieldChange(index, "name", e.target.value)}
              sx={{ flex: 1, mr: 2 }}
            />
            <IconButton color="error" onClick={() => handleDeleteField(field.id, true)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        );

      case "ingredients":
        return (
          <Box key={field.name} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TextField
              label="재료 이름"
              value={field.name}
              onChange={(e) => handleFieldChange(index, "name", e.target.value)}
              sx={{ flex: 1, mr: 2 }}
            />
            <TextField
              label="양"
              value={field.volume}
              onChange={(e) => handleFieldChange(index, "volume", e.target.value)}
              sx={{ flex: 1, mr: 2 }}
            />
            <IconButton color="error" onClick={() => handleDeleteField(field.id, true)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        );

      default:
        return null;
    }
  });
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
    setSubFormData(getInitialSubFormData);
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


      {/* 하위 컬렉션 관리 */}
      {selectedRecipeId && selectedSubCollection && (
        <Box>
          <Typography variant="h5" gutterBottom>
            {selectedSubCollection} 관리
          </Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
  {subCollectionData.map((data, index) => (
    <Box key={data.id} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      {selectedSubCollection === "ingredients" && (
        <>
          <TextField
            label="재료 이름"
            value={data.name || ""}
            onChange={(e) => handleFieldChange(index, "name", e.target.value, false)}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            label="양"
            value={data.volume || ""}
            onChange={(e) => handleFieldChange(index, "volume", e.target.value, false)}
            sx={{ flex: 1, mr: 2 }}
          />
        </>
      )}

      {selectedSubCollection === "equipment" && (
        <TextField
          label="도구 이름"
          value={data.name || ""}
          onChange={(e) => handleFieldChange(index, "name", e.target.value, false)}
          sx={{ flex: 1, mr: 2 }}
        />
      )}

      {selectedSubCollection === "cooking_methods" && (
        <>
          <TextField
            label="제목"
            value={data.title || ""}
            onChange={(e) => handleFieldChange(index, "title", e.target.value, false)}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            label="설명"
            value={data.description || ""}
            onChange={(e) => handleFieldChange(index, "description", e.target.value, false)}
            sx={{ flex: 2, mr: 2 }}
          />
          <TextField
            label="스텝"
            type="number"
            value={data.step || ""}
            onChange={(e) => handleFieldChange(index, "step", e.target.value, false)}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            label="시간"
            value={data.time || ""}
            onChange={(e) => handleFieldChange(index, "time", e.target.value, false)}
            sx={{ flex: 1, mr: 2 }}
          />
        </>
      )}

      <IconButton color="error" onClick={() => handleDeleteField(data.id, false)}>
        <DeleteIcon />
      </IconButton>
    </Box>
  ))}

  {/* 새 필드 추가 */}
  {newFields.map((field, index) => (
    <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      {selectedSubCollection === "ingredients" && (
        <>
          <TextField
            label="재료 이름"
            value={field.name || ""}
            onChange={(e) => handleFieldChange(index, "name", e.target.value, true)}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            label="양"
            value={field.volume || ""}
            onChange={(e) => handleFieldChange(index, "volume", e.target.value, true)}
            sx={{ flex: 1, mr: 2 }}
          />
        </>
      )}

      {selectedSubCollection === "equipment" && (
        <TextField
          label="도구 이름"
          value={field.name || ""}
          onChange={(e) => handleFieldChange(index, "name", e.target.value, true)}
          sx={{ flex: 1, mr: 2 }}
        />
      )}

      {selectedSubCollection === "cooking_methods" && (
        <>
          <TextField
            label="제목"
            value={field.title || ""}
            onChange={(e) => handleFieldChange(index, "title", e.target.value, true)}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            label="설명"
            value={field.description || ""}
            onChange={(e) => handleFieldChange(index, "description", e.target.value, true)}
            sx={{ flex: 2, mr: 2 }}
          />
          <TextField
            label="스텝"
            type="number"
            value={field.step || ""}
            onChange={(e) => handleFieldChange(index, "step", e.target.value, true)}
            sx={{ flex: 1, mr: 2 }}
          />
          <TextField
            label="시간"
            value={field.time || ""}
            onChange={(e) => handleFieldChange(index, "time", e.target.value, true)}
            sx={{ flex: 1, mr: 2 }}
          />
        </>
      )}

      <IconButton color="error" onClick={() => handleDeleteField(field.id, true)}>
        <DeleteIcon />
      </IconButton>
    </Box>
  ))}
</Paper>


          <Button variant="contained" onClick={handleAddField} sx={{ mr: 2 }}>
            필드 추가
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveAll}>
            저장
          </Button>
          {renderSubFields()}
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
              setFormData({ ...formData, level: parseInt(e.target.value, 10) || 0 })
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

    </Box>

  );
};


export default RecipeManager;