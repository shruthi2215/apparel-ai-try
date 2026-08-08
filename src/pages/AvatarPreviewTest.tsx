import Avatar3DViewer from "@/components/avatar/Avatar3DViewer";
export default function AvatarPreviewTest() {
  return <div className="p-8 grid grid-cols-2 gap-4 max-w-3xl">
    <Avatar3DViewer gender="female" bodySize="S" skinTone="#d8ab8a" garmentColor="#c0392b" />
    <Avatar3DViewer gender="male" bodySize="3XL" skinTone="#8d5a3b" garmentColor="#1a2f5a" />
  </div>;
}
