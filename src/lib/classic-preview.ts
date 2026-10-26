/** The approved paper design is primary; alternate editions keep their own links. */
export function getClassicEdition(pathname: string) {
  const within = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  const basePath = within('/classic') ? '/classic' : within('/v3') ? '/v3' : '';
  const paper = basePath !== '/classic';
  return {basePath, paper, sessionKey: paper ? 'scratch:paper:entered' : 'scratch:entered'};
}
