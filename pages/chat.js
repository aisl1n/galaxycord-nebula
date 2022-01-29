import { Box, Text, TextField, Image, Button } from '@skynexui/components'
import React from 'react'
import appConfig from '../config.json'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker'

//Dados localizados no site do Supabase
const SUPABASE_ANON_KEY ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzM5NjEwNCwiZXhwIjoxOTU4OTcyMTA0fQ.axeTN2ZPAyO-12XM5qkifLQHmpiJSKxVm1Y6Xv2qh1o'
const SUPABASE_URL = 'https://zwguievsysxwanwszklw.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function escutaMensagensEmTempoReal(adicionaMensagem) {
  return supabaseClient
    .from('mensagens')
    .on('INSERT', (respostaLive) => {
      adicionaMensagem(respostaLive.new)
    })
    .subscribe()
}

export default function ChatPage() {
  const roteamento = useRouter()
  const usuarioLogado = roteamento.query.username
  const [mensagem, setMensagem] = React.useState('')
  const [listaDeMensagens, setListaDeMensagens] = React.useState([])

  React.useEffect(() => {
    supabaseClient
      .from('mensagens')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        // console.log('Dados da consulta', data)
        setListaDeMensagens(data)
      })

      escutaMensagensEmTempoReal((novaMensagem) => {
        // console.log('Nova mensagem:', novaMensagem)
        setListaDeMensagens((valorAtualDaLista) => {
          return [
            novaMensagem,
            ...valorAtualDaLista,
          ]
        })
      })
  }, [])

  /*
  // Usuário
    - Usuário digita no campo textarea
    - Aperta enter para enviar
    - Tem que adicionar o texto na listagem
    
    // Dev
    - [X] Campo criado
    - [X] Vamos usar o onChange usa o useState (ter if pra caso seja enter pra limpar a variavel)
    - [X] Lista de mensagens 
    */
  function handleNovaMensagem(novaMensagem) {
    const mensagem = {
      // id: listaDeMensagens.length + 1,
      de: usuarioLogado,
      texto: novaMensagem,
    }

    supabaseClient
      .from('mensagens')
      .insert([mensagem])
      .then(({ data }) => {
        console.log('Criando mensagem: ', data)
      })

    setMensagem('')
  }

  return (
    <Box
      styleSheet={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://wallpaperaccess.com/full/214926.jpg)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        color: appConfig.theme.colors.neutrals['000'],
      }}
    >
      <Box
        styleSheet={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
          borderRadius: '5px',
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: '100%',
          maxWidth: '95%',
          maxHeight: '95vh',
          padding: '32px',
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: '80%',
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: 'column',
            borderRadius: '5px',
            padding: '16px',
          }}
        >
          <MessageList mensagens={listaDeMensagens} />
          {/* {listaDeMensagens.map((mensagemAtual) => {
                        return (
                            <li key={mensagemAtual.id}>
                                {mensagemAtual.de}: {mensagemAtual.texto}
                            </li>
                        )
                    })} */}
          <Box
            as='form'
            styleSheet={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => {
                const valor = event.target.value
                setMensagem(valor)
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleNovaMensagem(mensagem)
                }
              }}
              placeholder='Insira sua mensagem aqui...'
              type='textarea'
              styleSheet={{
                width: '100%',
                border: '0',
                resize: 'none',
                borderRadius: '5px',
                padding: '6px 8px',
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <Button
              variant='primary'
              colorVariant='positive'
              label='Enviar'
              buttonColors={{
                contrastColor: appConfig.theme.colors.neutrals['000'],
                mainColor: appConfig.theme.colors.primary[500],
                mainColorLight: appConfig.theme.colors.primary[400],
                mainColorStrong: appConfig.theme.colors.primary[600],
              }}
              onClick={(event) => {
                event.preventDefault()
                handleNovaMensagem(mensagem)
              }}
            />
            <ButtonSendSticker 
              onStickerClick={(sticker) => {
                console.log('[Usando o componente] Salva esse sticker no banco', sticker)
                handleNovaMensagem(`:sticker:${sticker}`)
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: '100%',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text variant='heading2'>Chat</Text>
        <Button
          variant='primary'
          label='Logout'
          href='/'
          buttonColors={{
            contrastColor: appConfig.theme.colors.neutrals['000'],
            mainColor: appConfig.theme.colors.primary[500],
            mainColorLight: appConfig.theme.colors.primary[400],
            mainColorStrong: appConfig.theme.colors.primary[600],
          }}
        />
      </Box>
    </>
  )
}

function MessageList(props) {
  return (
    <Box
      tag='ul'
      styleSheet={{
        
        overflow: 'scroll',
        display: 'flex',
        flexDirection: 'column-reverse',
        flex: 1,
        color: appConfig.theme.colors.neutrals['000'],
        marginBottom: '16px',
      }}
    >
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag='li'
            styleSheet={{
              borderRadius: '5px',
              padding: '6px',
              marginBottom: '10px',
              hover: {
                backgroundColor: appConfig.theme.colors.primary[600],
              }
            }}
          >
            <Box
              styleSheet={{
                marginBottom: '8px',
                display: 'flex',
              }}
            >
              <Image
                styleSheet={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '10px',
                }}
                src={`https://github.com/${mensagem.de}.png`}
              />

                <Text tag='strong'>
                  {mensagem.de} 
                </Text>

              <Text
                styleSheet={{
                  fontSize: '10px',
                  marginLeft: '8px',
                  marginTop: '4px',
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag='span'
                >
                {(new Date().toLocaleDateString())}
              </Text>
            </Box>

            {mensagem.texto.startsWith(':sticker:')
              ?(
                <Image src={mensagem.texto.replace(':sticker:', '')} />
              )
              : (
                mensagem.texto
              )}
          </Text>
        )
      })}
    </Box>
  )
}
