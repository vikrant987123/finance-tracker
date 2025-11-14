import React, { useState } from "react";
import axios from "axios";

interface BillUploadProps {
  // now we pass both the uploaded URL and the original filename (optional)
  onUploadSuccess: (url: string, filename?: string) => void;
}

const CLOUD_NAME = "dkjdgb8rn"; // <-- replace with your Cloudinary cloud name
const UPLOAD_PRESET = "upload_preset"; // <-- replace with your actual unsigned preset

export const BillUpload: React.FC<BillUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      const url = response.data.secure_url as string;
      const filename = file.name;

      console.log("✅ Uploaded image URL:", url, "filename:", filename);

      // pass both url and filename to parent
      onUploadSuccess(url, filename);
    } catch (error) {
      console.error("Upload failed:", error);
      // optionally you can call onUploadSuccess(null) or show a toast
    } finally {
      setUploading(false);
      // clear the input value so same file can be re-selected if needed
      // (find the input element and reset it)
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = "";
    }
  };

  return (
    <div className="upload-container">
      <label>Upload Receipt:</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
