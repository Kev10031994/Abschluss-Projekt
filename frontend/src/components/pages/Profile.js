import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Profile.css";

const Profile = () => {
  const { user, updateProfileImage } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const image = reader.result;
        setProfileImage(image);
        updateProfileImage(image); // Profilbild im Kontext speichern
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profil</h1>
      <div className="profile-content">
        <div className="profile-info">
          <h2>Benutzerinformationen</h2>
          <p>
            <strong>Name:</strong> {user?.username || "Unbekannt"}
          </p>
          <p>
            <strong>E-Mail:</strong> {user?.email || "Keine E-Mail hinterlegt"}
          </p>
        </div>
        <div className="profile-image">
          <h2>Profilbild</h2>
          <div className="image-preview">
            {profileImage ? (
              <img src={profileImage} alt="Profilbild" className="profile-img" />
            ) : (
              <p className="placeholder-text">Kein Bild hochgeladen</p>
            )}
          </div>
          <label htmlFor="image-upload" className="upload-label">
            Bild hochladen
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="upload-input"
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
