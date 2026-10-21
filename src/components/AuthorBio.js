import { ResponsiveImage } from "./ResponsiveImage";

export const AuthorBio = ({
  name,
  imageUrl,
  authorSrc,
  authorSrcSet,
  authorSizes,
  imageIndex,
  bio,
  birth,
  death,
  nationality,
  domain,
  knownFor,
}) => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-40 items-center mt-10">
      {/* IMAGE */}
      <div className="flex justify-center">
        <ResponsiveImage
          src={authorSrc || imageUrl}
          srcSet={authorSrcSet}
          sizes={authorSizes}
          alt={`CarouselImage ${imageIndex}`}
          className="w-[350px] md:w-[450px] rounded-2xl shadow-xl"
          loading="lazy"
          decoding="async"
          width={350}
          height={450}
        />
      </div>

      {/* BIO + INFOS MONOCHROME */}
      <div className="space-y-8">
        {/* BIO ENRICHIE */}
        <div className="relative p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-lg">
          <p className="text-gray-800 leading-relaxed text-lg md:text-xl font-light tracking-wide p-5">
            {bio}
          </p>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {birth && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-1">
                  Période
                </p>
                <p className="font-bold text-gray-900 text-sm">
                  {birth} {death ? `- ${death}` : ""}
                </p>
              </div>
            </div>
          )}

          {nationality && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-1">
                  Nationalité
                </p>
                <p className="font-bold text-gray-900 text-sm">{nationality}</p>
              </div>
            </div>
          )}

          {domain && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-1">
                  Domaine
                </p>
                <p className="font-bold text-gray-900 text-sm">{domain}</p>
              </div>
            </div>
          )}

          {knownFor && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm flex items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-medium text-gray-500 mb-1">
                  Connu pour
                </p>
                <p className="font-bold text-gray-900 text-sm">{knownFor}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
