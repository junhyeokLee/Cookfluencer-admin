import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase"; // Firebase 설정 가져오기

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cooking_time: "",
    finishing: "",
    level: "",
    tip_knowhow: "",
    video_id: "",
  });

  const recipeCollectionRef = collection(db, "recipe");

  // Firestore 데이터 불러오기
  const fetchRecipes = async () => {
    const data = await getDocs(recipeCollectionRef);
    setRecipes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // 데이터 추가
  const addRecipe = async () => {
    await addDoc(recipeCollectionRef, formData);
    setFormData({
      name: "",
      description: "",
      cooking_time: "",
      finishing: "",
      level: "",
      tip_knowhow: "",
      video_id: "",
    });
    fetchRecipes(); // 추가 후 새로고침
  };

  return (
    <div>
      <h1>Recipe 관리</h1>

      {/* 입력 폼 */}
      <div>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Cooking Time"
          value={formData.cooking_time}
          onChange={(e) => setFormData({ ...formData, cooking_time: e.target.value })}
        />
        <input
          type="text"
          placeholder="Finishing"
          value={formData.finishing}
          onChange={(e) => setFormData({ ...formData, finishing: e.target.value })}
        />
        <input
          type="number"
          placeholder="Level"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tip/Knowhow"
          value={formData.tip_knowhow}
          onChange={(e) => setFormData({ ...formData, tip_knowhow: e.target.value })}
        />
        <input
          type="text"
          placeholder="Video ID"
          value={formData.video_id}
          onChange={(e) => setFormData({ ...formData, video_id: e.target.value })}
        />
        <button onClick={addRecipe}>추가</button>
      </div>

      {/* 데이터 목록 */}
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <p>Name: {recipe.name}</p>
            <p>Description: {recipe.description}</p>
            <p>Cooking Time: {recipe.cooking_time}</p>
            <p>Finishing: {recipe.finishing}</p>
            <p>Level: {recipe.level}</p>
            <p>Tip/Knowhow: {recipe.tip_knowhow}</p>
            <p>Video ID: {recipe.video_id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recipe;
