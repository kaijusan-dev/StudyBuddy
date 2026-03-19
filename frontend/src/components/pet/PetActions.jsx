export default function PetActions({ pet, onFeed }) {
  return (
    <div>
      <button onClick={onFeed} disabled={pet.fullness == 100}>🍖 Feed</button>
    </div>
  );
}