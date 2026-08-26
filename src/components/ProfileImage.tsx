type ProfileImageProps = {
  className: string
}

function ProfileImage({ className }: ProfileImageProps) {
  const imageBase = `${import.meta.env.BASE_URL}images/profile`

  return (
    <img
      className={className}
      src={`${imageBase}-640.webp`}
      srcSet={`${imageBase}-320.webp 320w, ${imageBase}-640.webp 640w`}
      sizes="(max-width: 23rem) calc(100vw - 2rem), 20rem"
      width="640"
      height="640"
      alt="Portrait of Kevin"
      decoding="async"
    />
  )
}

export default ProfileImage
