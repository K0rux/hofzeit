import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PasswordResetEmailProps {
  resetLink: string
  email: string
}

export default function PasswordResetEmail({
  resetLink,
  email,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Passwort zurücksetzen - HofZeit</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Passwort zurücksetzen</Heading>
          <Text style={text}>
            Du hast eine Anfrage zum Zurücksetzen deines Passworts für dein HofZeit-Konto
            ({email}) gestellt.
          </Text>
          <Text style={text}>
            Klicke auf den folgenden Button, um ein neues Passwort zu setzen:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Passwort zurücksetzen
            </Button>
          </Section>
          <Text style={text}>
            Dieser Link ist <strong>1 Stunde gültig</strong>. Danach musst du eine neue
            Anfrage stellen.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail einfach
            ignorieren. Dein Passwort wird nicht geändert.
          </Text>
          <Text style={footer}>
            Bei Fragen wende dich bitte an deinen Administrator.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
}

const buttonContainer = {
  padding: '27px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 40px',
}
