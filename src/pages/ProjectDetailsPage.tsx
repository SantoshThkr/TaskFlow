import { useParams } from 'react-router-dom';

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return <h1>Project {projectId}</h1>;
}
