export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "School",
    name: "Superior Minds Academy",
    description:
      "A premier nursery and primary school in Minna, Nigeria, combining academic excellence, character development and modern teaching methods.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Minna",
      addressRegion: "Niger State",
      addressCountry: "NG",
    },
    telephone: "+234-000-000-0000",
    email: "admissions@superiorminds.edu.ng",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
