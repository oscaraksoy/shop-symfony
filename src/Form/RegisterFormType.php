<?php

namespace App\Form;

use App\FormData\RegisterFormData;
use App\Type\Component\EmailType;
use App\Type\Component\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Contracts\Translation\TranslatorInterface;

class RegisterFormType extends AbstractType
{
    /**
     * @var TranslatorInterface
     */
    private $translator;

    public function __construct (TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function buildForm (FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, [
                'attr' => ['autofocus' => true],
            ])
            ->add('email', EmailType::class)
            ->add('is_agree_with_terms', null, [
                'label' => $this->translator->trans('Agree terms')
            ])
            ->add('password', PasswordType::class, [
                'label' => false,
                'attr'  => ['placeholder' => $this->translator->trans('Password')],
                'help'  => $this->translator->trans('The password must contain at least 6 chars')
            ])
            ->add('password_confirmation', PasswordType::class, [
                'label' => false,
                'attr'  => ['placeholder' => $this->translator->trans('Confirm your password')]
            ]);
    }

    public function configureOptions (OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => RegisterFormData::class,
        ]);
    }
}