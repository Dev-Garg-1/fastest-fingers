export default function Footer() {
  return (
    <footer className="bg-[#FADA7A] text-black mt-auto">
      <div className="container mx-auto text-center p-4 text-sm">
        &copy; {new Date().getFullYear()} Fastest Fingers. All rights reserved.
      </div>
    </footer>
  );
}
