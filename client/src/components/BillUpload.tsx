import React, { useState } from "react";
import axios from "axios";

interface BillUploadProps {
  onUploadSuccess: (url: string) => void;
}

const CLOUD_NAME = "dkjdgb8rn"; // ✅ your Cloudinary cloud name
const UPLOAD_PRESET = "upload_preset"; // ✅ match the actual preset name from Cloudinary


export const BillUpload: React.FC<BillUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); // ✅ corrected

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, // ✅ dynamic
      formData
    );

    const url = response.data.secure_url;
    console.log("✅ Uploaded image URL:", url); 
    setPreviewUrl(url);
    onUploadSuccess(url);
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="upload-container">
      <label>Upload Receipt:</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {/* {previewUrl && (
        // <div>
        //   <p>Preview:</p>
        //   <img src={previewUrl} alt="Receipt Preview" style={{ maxWidth: "200px" }} />
        // </div>
      )} */}
    </div>
  );
};
