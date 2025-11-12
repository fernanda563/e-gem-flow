import { StlViewer } from "react-stl-viewer";

interface STLViewerProps {
  fileUrl: string;
  height?: string;
  width?: string;
}

export function STLViewer({ 
  fileUrl, 
  height = "400px", 
  width = "100%"
}: STLViewerProps) {
  return (
    <div style={{ height, width }} className="relative rounded-lg overflow-hidden border border-border bg-muted">
      <StlViewer
        url={fileUrl}
        style={{
          height: "100%",
          width: "100%",
        }}
        orbitControls
        shadows
      />
      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md text-xs text-muted-foreground border border-border">
        Arrastra para rotar • Scroll para zoom
      </div>
    </div>
  );
}
