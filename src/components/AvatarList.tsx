import type { FC } from 'hono/jsx'

type Person = {
  name: string
  profile_image_url: string
}

export const AvatarList: FC<{ people: Person[] }> = ({ people }) => {
  return (
    <ul class="avatar-list">
      {people.map((person) => (
        <li>
          <figure>
            <img src={person.profile_image_url} alt={person.name} />
            <figcaption>{person.name}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
