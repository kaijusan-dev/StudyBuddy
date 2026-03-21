import { useRef } from "react";
import api from "../../api/api";
import Avatar from "../avatar/Avatar";

export default function AvatarUpload({ user, onUpload }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click(); // имитируем клик на input
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onUpload(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="AvatarUpload">

      <Avatar avatar={user?.avatar} onClick={handleClick}/>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}

